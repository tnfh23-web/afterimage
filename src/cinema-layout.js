export const CINEMA_ID=11;
export const cinema={id:CINEMA_ID,number:'2F',title:'상영관',x:20,z:2,y:8.2,w:16,d:26,h:9.2};
export const cinemaGround=(x,z)=>cinema.y+Math.max(0,Math.min(4,Math.ceil((z-cinema.z-.4)/3.6)))*.24;
