import {assetUrl} from './asset-url';
export const rooms = [
 {id:0, number:'01', title:'낮은 하늘', en:'A LOWER SKY', x:0,z:0,color:0xffd4a2, sculpture:'통과하지 못한 문', artist:'서이안', medium:'석회석, 두 개의 문틀 · 2026', painting:'문 너머의 저녁', note:'문을 통과하면 다른 곳에 도착할 것이라 믿었다. 그러나 이 문은 어디에도 연결되지 않는다. 두 개의 어긋난 틀 사이에, 아직 떠나지 못한 시간이 남아 있다.'},
 {id:1, number:'02', title:'잠든 정원', en:'THE SLEEPING GARDEN', x:22,z:0,color:0xe9e4ce, sculpture:'중력 없는 가지', artist:'한서림', medium:'황동, 얇은 알루미늄, 돌 · 2026', painting:'밤에만 자라는 것들', note:'뿌리는 돌 속에 잠들고, 잎은 공중에서 천천히 흔들린다. 정원은 사람이 떠난 뒤에야 제 속도로 자란다. 움직임을 재촉하지 않고 조금 더 머물러 보자.'},
 {id:2, number:'03', title:'얼굴 없는 초상', en:'PORTRAITS WITHOUT A FACE', x:44,z:0,color:0xffc993, sculpture:'이름을 잊은 세 사람', artist:'윤모래', medium:'구리, 주름진 석고 · 2026', painting:'알 수 없는 초상', note:'얼굴이 사라졌다고 해서 존재까지 사라지는 것은 아니다. 천의 주름과 고개를 기울인 각도에 서로 다른 기억이 남는다. 우리는 얼굴보다 오래 무엇을 기억할까.'},
 {id:3, number:'04', title:'거꾸로 흐르는 시간', en:'TIME RUNNING BACKWARDS', x:44,z:-22,color:0xffbf78, sculpture:'불완전한 공전', artist:'류하온', medium:'산화 구리, 석고, 운동 장치 · 2026', painting:'끝나지 않는 일식', note:'원은 돌아오지만 같은 순간으로 돌아오지는 않는다. 서로 다른 속도로 회전하는 두 궤도, 한 박자 어긋난 추. 여기에서는 지나간 순간이 다음 순간을 기다린다.'},
 {id:4, number:'05', title:'남겨진 바다', en:'THE SEA THAT REMAINS', x:22,z:-22,color:0xb3d2ff, sculpture:'파도의 뼈', artist:'도유진', medium:'청색 알루미늄, 부유하는 돌 · 2026', painting:'해수면 위의 정적', note:'물이 사라진 자리에도 파도의 모양은 남아 있다. 서른두 개의 단면이 한 번도 멈춘 적 없는 움직임을 붙잡는다. 돌은 떨어질 듯, 끝내 떨어지지 않는다.'},
 {id:5, number:'06', title:'깨어나기 직전', en:'BEFORE WAKING', x:0,z:-22,color:0xffedcf, sculpture:'다음 장면의 입구', artist:'차은오', medium:'석고, 빛, 비스듬한 문 · 2026', painting:'아무 일도 없는 아침', note:'꿈의 마지막 장면은 늘 입구와 닮아 있다. 빛이 닿는 가장자리를 따라, 이곳에서 본 것들이 서서히 희미해진다. 남는 것은 형태보다 오래 지속되는 감각이다.'},
 {id:6, number:'07', title:'접힌 빛', en:'FOLDED LIGHT', x:66,z:0,color:0xffe2b5, sculpture:'빛이 머무는 접힘', artist:'이서온', medium:'석고, 굽힌 면 · 2026', painting:'종이 사이의 오후', note:'빛은 평평한 면 위에 오래 머무르지 못한다. 천천히 접힌 곡면이 밝음과 그늘을 서로 다른 방향으로 돌려보낸다. 같은 형태를 한 바퀴 돌아보면, 접힘은 펼쳐짐과 닮아 있다.'},
 {id:7, number:'08', title:'고요한 균형', en:'A QUIET BALANCE', x:88,z:0,color:0xffe7c6, sculpture:'서로의 무게', artist:'문해솔', medium:'황동, 세 개의 석고 타원, 균형 장치 · 2026', painting:'떠오르는 섬', note:'가장 가벼운 움직임에도 전체의 균형은 달라진다. 세 개의 타원은 서로의 무게를 기다리며 작은 원을 그린다. 멈춰 있는 것처럼 보이는 순간에도 관계는 계속 움직인다.'},
 {id:8, number:'09', title:'여백의 층', en:'LAYERS OF SILENCE', x:88,z:-22,color:0xd5e5ef, sculpture:'말하지 않은 일곱 문장', artist:'백여린', medium:'석고, 일곱 개의 곡면 · 2026', painting:'안개가 지나는 자리', note:'일곱 개의 면 사이에는 아무것도 놓이지 않았다. 그러나 관람자가 옆으로 움직일 때마다 그 빈틈이 다른 풍경을 만든다. 여기에서 중요한 것은 형태보다 형태 사이의 거리다.'},
 {id:9, number:'10', title:'숨의 결', en:'THE SHAPE OF BREATH', x:66,z:-22,color:0xffdcc7, sculpture:'천천히, 다시', artist:'정하루', medium:'석고, 황동, 나선형 띠 · 2026', painting:'빛이 돌아오는 시간', note:'숨은 같은 길을 오가지만 매번 조금 다른 시간을 남긴다. 넓은 띠가 천천히 올라가며 안과 밖을 바꾼다. 마지막 장면에서 다시 시작되는 것은 움직임보다 작은 여유다.'}
];
// The original loop remains intact; the eastern loop opens from rooms 03/04.
export const connections=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[2,6],[6,7],[7,8],[8,9],[9,3]];
export const artInfo = (id,kind='sculpture') => ({...rooms[id],kind,name:kind==='painting'?rooms[id].painting:rooms[id].sculpture,medium:kind==='painting'?'디지털 회화 · 2026':rooms[id].medium});
export const paintingUrl = id => assetUrl(id === 0 ? '/art/painting-match.webp' : `/art/painting-match-${String(id+1).padStart(2,'0')}.webp`);
