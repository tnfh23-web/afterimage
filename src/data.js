import {assetUrl} from './asset-url';
export const rooms = [
 {id:0, number:'01', title:'낮은 하늘', en:'A LOWER SKY', x:0,z:0,color:0xffd4a2, sculpture:'통과하지 못한 문', artist:'서이안', medium:'석회석, 두 개의 문틀 · 2026', painting:'문 너머의 저녁', note:'문을 통과하면 다른 곳에 도착할 것이라 믿었다. 그러나 이 문은 어디에도 연결되지 않는다. 두 개의 어긋난 틀 사이에, 아직 떠나지 못한 시간이 남아 있다.'},
 {id:1, number:'02', title:'잠든 정원', en:'THE SLEEPING GARDEN', x:22,z:0,color:0xe9e4ce, sculpture:'중력 없는 가지', artist:'한서림', medium:'황동, 얇은 알루미늄, 돌 · 2026', painting:'밤에만 자라는 것들', note:'뿌리는 돌 속에 잠들고, 잎은 공중에서 천천히 흔들린다. 정원은 사람이 떠난 뒤에야 제 속도로 자란다. 움직임을 재촉하지 않고 조금 더 머물러 보자.'},
 {id:2, number:'03', title:'얼굴 없는 초상', en:'PORTRAITS WITHOUT A FACE', x:44,z:0,color:0xffc993, sculpture:'이름을 잊은 세 사람', artist:'윤모래', medium:'구리, 주름진 석고 · 2026', painting:'알 수 없는 초상', note:'얼굴이 사라졌다고 해서 존재까지 사라지는 것은 아니다. 천의 주름과 고개를 기울인 각도에 서로 다른 기억이 남는다. 우리는 얼굴보다 오래 무엇을 기억할까.'},
 {id:3, number:'04', title:'거꾸로 흐르는 시간', en:'TIME RUNNING BACKWARDS', x:44,z:-22,color:0xffbf78, sculpture:'불완전한 공전', artist:'류하온', medium:'산화 구리, 석고, 운동 장치 · 2026', painting:'끝나지 않는 일식', note:'원은 돌아오지만 같은 순간으로 돌아오지는 않는다. 서로 다른 속도로 회전하는 두 궤도, 한 박자 어긋난 추. 여기에서는 지나간 순간이 다음 순간을 기다린다.'},
 {id:4, number:'05', title:'남겨진 바다', en:'THE SEA THAT REMAINS', x:22,z:-22,color:0xb3d2ff, sculpture:'파도의 뼈', artist:'도유진', medium:'청색 알루미늄, 부유하는 돌 · 2026', painting:'해수면 위의 정적', note:'물이 사라진 자리에도 파도의 모양은 남아 있다. 서른두 개의 단면이 한 번도 멈춘 적 없는 움직임을 붙잡는다. 돌은 떨어질 듯, 끝내 떨어지지 않는다.'},
 {id:5, number:'06', title:'깨어나기 직전', en:'BEFORE WAKING', x:0,z:-22,color:0xffedcf, sculpture:'다음 장면의 입구', artist:'차은오', medium:'석고, 빛, 비스듬한 문 · 2026', painting:'아무 일도 없는 아침', note:'꿈의 마지막 장면은 늘 입구와 닮아 있다. 빛이 닿는 가장자리를 따라, 이곳에서 본 것들이 서서히 희미해진다. 남는 것은 형태보다 오래 지속되는 감각이다.'}
];
export const artInfo = (id,kind='sculpture') => ({...rooms[id],kind,name:kind==='painting'?rooms[id].painting:rooms[id].sculpture,medium:kind==='painting'?'디지털 회화 · 2026':rooms[id].medium});
export const paintingUrl = id => assetUrl(id === 0 ? '/art/painting-match.webp' : `/art/painting-match-${String(id+1).padStart(2,'0')}.webp`);
