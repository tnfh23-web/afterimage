export function createScore(context,destination){
 const master=context.createGain(),compressor=context.createDynamicsCompressor(),analyser=context.createAnalyser();
 master.gain.value=3.6;compressor.threshold.value=-14;compressor.knee.value=12;compressor.ratio.value=3;compressor.attack.value=.01;compressor.release.value=.25;
 master.connect(compressor);compressor.connect(analyser);analyser.connect(destination);analyser.fftSize=2048;
 const reverb=context.createConvolver(),wet=context.createGain(),length=Math.floor(context.sampleRate*2.2),impulse=context.createBuffer(2,length,context.sampleRate);
 for(let ch=0;ch<2;ch++){const data=impulse.getChannelData(ch);for(let i=0;i<length;i++)data[i]=Math.sin(i*137.51+ch*31.3)*Math.exp(-i/context.sampleRate*3)*.35;}
 reverb.buffer=impulse;wet.gain.value=.2;reverb.connect(wet);wet.connect(master);
 const note=(midi,at,peak,duration)=>{
  const envelope=context.createGain(),pan=context.createStereoPanner(),filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2400;pan.pan.value=Math.sin(midi)*.4;
  envelope.gain.setValueAtTime(.00001,at);envelope.gain.exponentialRampToValueAtTime(peak,at+.016);envelope.gain.exponentialRampToValueAtTime(peak*.2,at+.9);envelope.gain.exponentialRampToValueAtTime(.00001,at+duration);
  envelope.connect(filter);filter.connect(pan);pan.connect(master);pan.connect(reverb);
  for(const [partial,weight] of [[1,1],[2,.18],[3,.065],[4,.018]]){const osc=context.createOscillator(),level=context.createGain();osc.frequency.value=440*2**((midi-69)/12)*partial;level.gain.value=weight;osc.connect(level);level.connect(envelope);osc.start(at);osc.stop(at+duration+.01);}
 };
 return {analyser,schedule(origin){
  const chords=[[48,55,60,64,71],[53,60,64,67,69],[57,60,64,67,71],[55,62,65,69,74],[48,55,60,64,67],[53,60,64,67,72],[55,62,67,69,74],[48,55,60,64,72]];
  const melody=[76,79,83,81,79,76,74,72,76,79,84,83,81,79,76,72];
  chords.forEach((chord,i)=>{chord.forEach((midi,j)=>note(midi,origin+i*6+j*.12,j?.048:.095,5.8));for(let n=0;n<4;n++)note(chord[1+n%4]+12,origin+i*6+.8+n*1.25,.08,3.6);});
  melody.forEach((midi,i)=>note(midi,origin+1.5+i*2.8,.105,4));
 },fade(at){master.gain.setTargetAtTime(.0001,at,.6);}};
}
