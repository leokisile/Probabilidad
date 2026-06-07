function correlation(x,y){
let mx=mean(x), my=mean(y);

let num=0,dx=0,dy=0;

for(let i=0;i<x.length;i++){
num+=(x[i]-mx)*(y[i]-my);
dx+=(x[i]-mx)**2;
dy+=(y[i]-my)**2;
}

return num/Math.sqrt(dx*dy);
}