const WORD_BANK = {
  "Condición": ["exactamente","al menos","como máximo"],
  "Número de cartas": ["1","2","3","4","5"],
  "Tipo de cartas": ["Ases","Reyes","Reinas","Jotas"],
  "Color de cartas": ["Rojas","Negras"],
  "Número de cartas sacadas": ["1","2","3","4","5"],
  "Reemplazo": ["con reemplazo","sin reemplazo"]
};

const container=document.getElementById("wordbank");

for(const tipo in WORD_BANK){

  const div=document.createElement("div");
  div.innerHTML=`<h4>${tipo}</h4>`;

  WORD_BANK[tipo].forEach(word=>{

    const block=document.createElement("span");
    block.className="block";
    block.innerText=word;
    block.draggable=true;
    block.dataset.type=tipo;

    block.addEventListener("dragstart",e=>{
      e.dataTransfer.setData("text",word);
      e.dataTransfer.setData("type",tipo);
    });

    div.appendChild(block);
  });

  container.appendChild(div);
}