function combinacion(n,k){
  if(k>n || k<0) return 0;
  let res=1;
  for(let i=1;i<=k;i++)
    res=res*(n-i+1)/i;
  return res;
}

function calcularProbabilidad({N,K,n,k,condicion}){

  let prob=0;

  if(n < k) return 0; // no se pueden sacar más cartas de las que se desean

  if(condicion==="exactamente"){
    prob=combinacion(K,k)*
         combinacion(N-K,n-k)/
         combinacion(N,n);
  }

  else if(condicion==="al menos"){
    for(let i=k;i<=Math.min(K,n);i++)
      prob+=combinacion(K,i)*
            combinacion(N-K,n-i)/
            combinacion(N,n);
  }

  else if(condicion==="como máximo"){
    for(let i=0;i<=k;i++)
      prob+=combinacion(K,i)*
            combinacion(N-K,n-i)/
            combinacion(N,n);
  }

  return prob;
}