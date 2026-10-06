// Use the shared, gesture-unlocked context so mobile video volume is adjustable.
// Half the recent soundtrack level, with a short ramp to avoid abrupt changes.
export function createFilmAudio(video){
 let source,gain,context,enabled=true,volume=.35;
 const update=()=>{
  video.muted=!enabled;
  if(gain){gain.gain.cancelScheduledValues(context.currentTime);gain.gain.setTargetAtTime(enabled?volume*.5:0,context.currentTime,.06);}
  else video.volume=volume*.5;
 };
 update();
 return {
  connect(nextContext){
   if(source)return;
   context=nextContext;
   source=context.createMediaElementSource(video);gain=context.createGain();
   gain.gain.value=enabled?volume*.5:0;
   source.connect(gain);gain.connect(context.destination);video.volume=1;
   update();
  },
  set(nextEnabled,nextVolume){enabled=nextEnabled;volume=Math.max(0,Math.min(1,nextVolume));update();},
  dispose(){source?.disconnect();gain?.disconnect();},
 };
}
