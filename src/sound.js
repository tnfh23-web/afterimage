// Original, warm felt-piano-style synthesis. Audio is enabled by default and
// allocated only on the visitor's first gesture; no external music recording.
export function createSound(onState){
 let context,master,filter,verb,noise,active=true,volume=.35,room=0;
 let scheduler,fadeTimer,nextBeat=0,beat=0,disposed=false,request=0,stepCount=0;
 const voices=new Set(),frequency=midi=>440*Math.pow(2,(midi-69)/12);
 // Cmaj9 / Fmaj9 / G6add9 / C6add9: open major voicings, no ominous drone.
 const chords=[[48,55,59,62,64],[53,60,64,67,69],[55,62,64,67,69],[48,55,60,62,69]];
 const melodies=[[67,72,76,74,72,69],[69,72,77,76,72,67],[64,67,72,76,74,72],[67,69,74,72,69,67],[72,74,76,79,76,72],[76,74,72,69,67,72],[72,76,79,76,74,72],[69,72,76,74,72,67],[67,72,74,76,74,72],[72,74,76,79,76,72]];
 function voice(osc,gain,stereo,time,duration){
  osc.connect(gain);gain.connect(stereo);stereo.connect(filter);osc.start(time);osc.stop(time+duration+.06);voices.add(osc);
  osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect();stereo.disconnect();};
 }
 function piano(midi,time,peak=.09,pan=0,duration=3.2){
  [[1,1,duration],[2.002,.18,duration*.4],[3.997,.025,duration*.19]].forEach(([ratio,level,tail])=>{
   const osc=context.createOscillator(),gain=context.createGain(),stereo=context.createStereoPanner();osc.type='sine';osc.frequency.value=frequency(midi)*ratio;stereo.pan.value=pan;
   gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(peak*level,time+.018);gain.gain.exponentialRampToValueAtTime(.0001,time+tail);
   voice(osc,gain,stereo,time,tail);
  });
 }
 function init(){
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('이 브라우저에서는 소리를 사용할 수 없어요.');
  context=new Audio();master=context.createGain();master.gain.value=0;master.connect(context.destination);
  filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2800;filter.Q.value=.3;filter.connect(master);
  let seed=7331;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296*2-1;};
  verb=context.createConvolver();const tail=context.createBuffer(2,Math.floor(context.sampleRate*1.65),context.sampleRate);
  for(let c=0;c<2;c++){const samples=tail.getChannelData(c);for(let i=0;i<samples.length;i++)samples[i]=random()*Math.pow(1-i/samples.length,3.5);}
  verb.buffer=tail;const wet=context.createGain();wet.gain.value=.14;filter.connect(verb);verb.connect(wet);wet.connect(master);
  noise=context.createBuffer(1,Math.floor(context.sampleRate*.18),context.sampleRate);const samples=noise.getChannelData(0);
  for(let i=0;i<samples.length;i++)samples[i]=random()*Math.pow(1-i/samples.length,2.6);
 }
 function schedule(){
  if(!active||context.state!=='running')return;
  const beatDuration=60/66;
  while(nextBeat<context.currentTime+.18){
   const part=beat%16,chord=chords[Math.floor(beat/16)%chords.length];
   if(part===0){piano(chord[0],nextBeat,.065,-.08,4.4);chord.slice(1).forEach((note,i)=>piano(note,nextBeat+.06+i*.09,.026,(i-1.5)*.14,4.2));}
   if(part===8)chord.slice(1,4).forEach((note,i)=>piano(note,nextBeat+i*.075,.024,(i-1)*.18,3.8));
   const index=[1,3,6,9,11,14].indexOf(part);
   if(index!==-1){const notes=melodies[room%melodies.length];piano(notes[(index+Math.floor(beat/64))%notes.length],nextBeat,.083+index%2*.006,Math.sin(beat*.4)*.28,3.1);}
   nextBeat+=beatDuration;beat++;
  }
 }
 function notify(){if(!disposed)onState(!active?'off':!context?'waiting':context.state==='running'&&!document.hidden?'playing':'paused');}
 async function setEnabled(value){
  if(disposed)return;const attempt=++request;clearTimeout(fadeTimer);
  if(!value){active=false;clearInterval(scheduler);if(context){master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(0,context.currentTime,.12);fadeTimer=setTimeout(()=>{if(!active){voices.forEach(v=>{try{v.stop();}catch{}});context.suspend();}},650);}notify();return;}
  try{
   if(!context){init();context.addEventListener('statechange',notify);}active=true;notify();await context.resume();if(disposed||attempt!==request)return;
   voices.forEach(v=>{try{v.stop();}catch{}});master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(volume,context.currentTime,.4);
   nextBeat=context.currentTime+.08;beat=0;clearInterval(scheduler);scheduler=setInterval(schedule,70);schedule();notify();
  }catch(error){if(disposed||attempt!==request)return;active=false;onState('error',error.message||'소리를 켤 수 없어요.');}
 }
 function visibility(){
  if(!context||!active)return;
  if(document.hidden){clearInterval(scheduler);context.suspend();}
  else context.resume().then(()=>{if(!active||disposed)return;nextBeat=context.currentTime+.1;clearInterval(scheduler);scheduler=setInterval(schedule,70);schedule();notify();}).catch(()=>{active=false;notify();});
 }
 document.addEventListener('visibilitychange',visibility);
 return {
  setEnabled,
  activate(){if(active&&!disposed&&!document.hidden&&context?.state!=='running')return setEnabled(true);},
  setVolume(value){volume=Math.max(0,Math.min(1,value));if(context&&active)master.gain.setTargetAtTime(volume,context.currentTime,.08);},
  setRoom(value){room=value;},
  cue(){if(active&&context?.state==='running'){piano(67,context.currentTime,.025,0,1);piano(72,context.currentTime+.07,.022,0,1.2);}},
  step(){
   if(!active||context?.state!=='running')return;
   const now=context.currentTime,source=context.createBufferSource(),low=context.createBiquadFilter(),gain=context.createGain(),pan=context.createStereoPanner();
   source.buffer=noise;low.type='lowpass';low.frequency.value=1050;low.Q.value=.45;gain.gain.value=.13;pan.pan.value=(stepCount++%2?1:-1)*.14;
   source.connect(low);low.connect(gain);gain.connect(pan);pan.connect(master);source.start(now);voices.add(source);
   const thud=context.createOscillator(),body=context.createGain();thud.frequency.setValueAtTime(120,now);thud.frequency.exponentialRampToValueAtTime(62,now+.12);
   body.gain.setValueAtTime(0,now);body.gain.linearRampToValueAtTime(.055,now+.008);body.gain.exponentialRampToValueAtTime(.0001,now+.13);
   thud.connect(body);body.connect(master);thud.start(now);thud.stop(now+.14);voices.add(thud);
   thud.onended=()=>{voices.delete(thud);thud.disconnect();body.disconnect();};source.onended=()=>{voices.delete(source);source.disconnect();low.disconnect();gain.disconnect();pan.disconnect();};
  },
  dispose(){disposed=true;active=false;clearInterval(scheduler);clearTimeout(fadeTimer);document.removeEventListener('visibilitychange',visibility);voices.forEach(v=>{try{v.stop();}catch{}});context?.close();}
 };
}
