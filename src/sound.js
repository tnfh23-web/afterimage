// An original, continuously scheduled ambient score. No network audio or autoplay.
// Everything is created only after the visitor explicitly turns sound on.
export function createSound(onState) {
 let context,master,filter,verb,delay,noise,active=false,volume=.35,room=0;
 let scheduler,fadeTimer,nextBeat=0,beat=0,disposed=false,request=0;
 const voices=new Set();
 const frequency=midi=>440*Math.pow(2,(midi-69)/12);
 const chords=[[50,57,60,64],[46,53,57,62],[48,55,60,64],[43,50,57,62]];
 const melodies=[[74,69,72,76,69],[69,72,77,74,72],[72,69,76,74,69],[77,74,69,72,74],[69,74,77,72,69],[76,74,72,69,74]];
 const envelope=(node,time,peak,duration,attack)=>{
  node.gain.setValueAtTime(0,time);node.gain.linearRampToValueAtTime(peak,time+attack);
  node.gain.exponentialRampToValueAtTime(.0001,time+duration);
 };
 function tone(midi,time,duration,peak,type='sine',pan=0,attack=.04){
  const osc=context.createOscillator(),gain=context.createGain(),stereo=context.createStereoPanner();
  osc.type=type;osc.frequency.value=frequency(midi);stereo.pan.value=pan;
  envelope(gain,time,peak,duration,attack);osc.connect(gain);gain.connect(stereo);stereo.connect(filter);
  osc.start(time);osc.stop(time+duration+.1);voices.add(osc);
  osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect();stereo.disconnect();};
 }
 function init(){
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio)throw new Error('이 브라우저에서는 소리를 사용할 수 없어요.');
  context=new Audio();master=context.createGain();master.gain.value=0;master.connect(context.destination);
  filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2200;filter.Q.value=.3;filter.connect(master);
  verb=context.createConvolver();const tail=context.createBuffer(2,context.sampleRate*3.6,context.sampleRate);
  // Deterministic, soft stereo reverb; never allocate it until audio is requested.
  let seed=7331;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296*2-1;};
  for(let c=0;c<2;c++){const samples=tail.getChannelData(c);for(let i=0;i<samples.length;i++)samples[i]=random()*Math.pow(1-i/samples.length,3);}
  verb.buffer=tail;const wet=context.createGain();wet.gain.value=.32;filter.connect(verb);verb.connect(wet);wet.connect(master);
  delay=context.createDelay(2);delay.delayTime.value=.56;const feedback=context.createGain();feedback.gain.value=.24;
  const echo=context.createGain();echo.gain.value=.13;filter.connect(delay);delay.connect(feedback);feedback.connect(delay);delay.connect(echo);echo.connect(master);
  noise=context.createBuffer(1,Math.floor(context.sampleRate*.14),context.sampleRate);const data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=random()*Math.pow(1-i/data.length,2);
 }
 function schedule(){
  if(!active||context.state!=='running')return;
  const beatDuration=60/54;
  while(nextBeat<context.currentTime+.18){
   const part=beat%8,chord=chords[Math.floor(beat/8)%4];
   if(part===0)chord.forEach((note,i)=>tone(note,nextBeat,beatDuration*9,.022,'triangle',(i-1.5)*.28,1.6));
   const index=[0,2,3,5,7].indexOf(part);
   if(index!==-1){const note=melodies[room][index];tone(note,nextBeat,4.8,.072,'sine',Math.sin(beat*1.7)*.45,.025);tone(note+12,nextBeat,2.1,.011,'sine',-.2,.018);}
   nextBeat+=beatDuration;beat++;
  }
 }
 function notify(){if(!disposed)onState(active&&context?.state==='running'&&!document.hidden?'playing':active?'paused':'off');}
 async function setEnabled(value){
  if(disposed)return;
  const attempt=++request;
  clearTimeout(fadeTimer);
  if(!value){active=false;clearInterval(scheduler);if(context){master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(0,context.currentTime,.12);fadeTimer=setTimeout(()=>{if(!active){voices.forEach(voice=>{try{voice.stop();}catch{}});context.suspend();}},650);}notify();return;}
  try{
   if(!context){init();context.addEventListener('statechange',notify);}
   active=true;notify();await context.resume();if(disposed||attempt!==request)return;
   voices.forEach(voice=>{try{voice.stop();}catch{}});
   master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(volume,context.currentTime,.4);
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
  setVolume(value){volume=Math.max(0,Math.min(1,value));if(context&&active)master.gain.setTargetAtTime(volume,context.currentTime,.08);},
  setRoom(value){room=value;if(context)filter.frequency.setTargetAtTime(value===4?1450:2200,context.currentTime,1.5);},
  cue(){if(active&&context?.state==='running')tone(81,context.currentTime,1.4,.025,'sine',0,.018);},
  step(){if(!active||context?.state!=='running')return;const source=context.createBufferSource(),gain=context.createGain(),low=context.createBiquadFilter();source.buffer=noise;low.type='lowpass';low.frequency.value=650;gain.gain.value=.026;source.connect(low);low.connect(gain);gain.connect(master);source.start();source.onended=()=>{source.disconnect();low.disconnect();gain.disconnect();};},
  dispose(){disposed=true;active=false;clearInterval(scheduler);clearTimeout(fadeTimer);document.removeEventListener('visibilitychange',visibility);voices.forEach(voice=>{try{voice.stop();}catch{}});context?.close();}
 };
}
