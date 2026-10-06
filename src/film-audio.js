// Use the shared, gesture-unlocked context so mobile video volume is adjustable.
// Match the gallery music at the same shared slider setting.
import {DEFAULT_VOLUME,FILM_MUSIC_GAIN} from './audio-levels';
export function createFilmAudio(video){
 let source,gain,context,enabled=true,volume=DEFAULT_VOLUME;
 const update=()=>{
  video.muted=!enabled;
  if(gain){gain.gain.cancelScheduledValues(context.currentTime);gain.gain.setTargetAtTime(enabled?volume*FILM_MUSIC_GAIN:0,context.currentTime,.06);}
  else video.volume=volume*FILM_MUSIC_GAIN;
 };
 update();
 return {
  connect(nextContext){
   if(source)return;
   context=nextContext;
   source=context.createMediaElementSource(video);gain=context.createGain();
   gain.gain.value=enabled?volume*FILM_MUSIC_GAIN:0;
   source.connect(gain);gain.connect(context.destination);video.volume=1;
   update();
  },
  set(nextEnabled,nextVolume){enabled=nextEnabled;volume=Math.max(0,Math.min(1,nextVolume));update();},
  dispose(){source?.disconnect();gain?.disconnect();},
 };
}
