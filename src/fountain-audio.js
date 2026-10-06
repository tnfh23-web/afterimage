// Quiet original water ambience, sharing the gallery's volume and mute bus.
export function fountainProximity(x,y,z,visible=true){
 const distance=Math.hypot(x,y-.6,z),t=Math.max(0,Math.min(1,(distance-2)/12));
 return visible?Math.pow(1-t*t*(3-2*t),2):0;
}
export function createFountainAudio(context,destination){
 const source=context.createBufferSource(),high=context.createBiquadFilter(),low=context.createBiquadFilter(),gain=context.createGain(),pan=context.createStereoPanner();
 const buffer=context.createBuffer(1,context.sampleRate*10,context.sampleRate),samples=buffer.getChannelData(0);
 let seed=4193,last=0;for(let i=0;i<samples.length;i++){seed=(seed*1664525+1013904223)>>>0;last=.66*last+.34*(seed/4294967296*2-1);const envelope=.88+.08*Math.sin(i/context.sampleRate*1.3)+.04*Math.sin(i/context.sampleRate*3.1);samples[i]=last*envelope;}
 source.buffer=buffer;source.loop=true;high.type='highpass';high.frequency.value=220;low.type='lowpass';low.frequency.value=4200;gain.gain.value=0;
 source.connect(high);high.connect(low);low.connect(gain);gain.connect(pan);pan.connect(destination);source.start();
 return {
  update(x,y,z,yaw,visible){const amount=fountainProximity(x,y,z,visible);gain.gain.setTargetAtTime(.18*amount,context.currentTime,.22);const horizontal=Math.hypot(x,z)||1;pan.pan.setTargetAtTime(Math.max(-.8,Math.min(.8,(-x*Math.cos(yaw)+z*Math.sin(yaw))/horizontal)),context.currentTime,.12);return amount;},
  dispose(){source.stop();for(const node of [source,high,low,gain,pan])node.disconnect();},
 };
}
