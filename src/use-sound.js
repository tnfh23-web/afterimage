import {useEffect,useRef,useState} from 'react';
import {createSound} from './sound';
export function useSound(room){
 const controller=useRef(null),[state,setState]=useState('waiting'),[volume,setVolume]=useState(.35),[error,setError]=useState('');
 useEffect(()=>{
  const engine=createSound((next,message='')=>{setState(next);setError(message);});controller.current=engine;
  const activate=()=>engine.activate();
  const key=e=>{if(!e.repeat&&!['Escape','Shift','Control','Alt','Meta'].includes(e.key))activate();};
  window.addEventListener('pointerdown',activate,true);window.addEventListener('keydown',key,true);
  return()=>{window.removeEventListener('pointerdown',activate,true);window.removeEventListener('keydown',key,true);engine.dispose();controller.current=null;};
 },[]);
 useEffect(()=>{controller.current?.setRoom(room);},[room]);
 return {state,volume,error,enabled:state==='waiting'||state==='playing'||state==='paused',
  toggle:()=>controller.current?.setEnabled(state!=='waiting'&&state!=='playing'&&state!=='paused'),
  changeVolume:value=>{setVolume(value);controller.current?.setVolume(value);},
  attachFilm:film=>controller.current?.attachFilm(film),
  cue:()=>controller.current?.cue(),step:()=>controller.current?.step()};
}
