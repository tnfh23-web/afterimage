import {useEffect,useRef,useState} from 'react';
import {createSound} from './sound';
export function useSound(room){
 const controller=useRef(null),[state,setState]=useState('off'),[volume,setVolume]=useState(.35),[error,setError]=useState('');
 useEffect(()=>{controller.current=createSound((next,message='')=>{setState(next);setError(message);});return()=>controller.current?.dispose();},[]);
 useEffect(()=>{controller.current?.setRoom(room);},[room]);
 return {state,volume,error,enabled:state==='playing'||state==='paused',
  toggle:()=>controller.current?.setEnabled(state!=='playing'&&state!=='paused'),
  changeVolume:value=>{setVolume(value);controller.current?.setVolume(value);},
  cue:()=>controller.current?.cue(),step:()=>controller.current?.step()};
}
