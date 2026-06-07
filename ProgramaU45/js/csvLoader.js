function parseCSV(text){
const lines = text.trim().split("\n");

const headers = lines[0]
    .split(",")
    .map(h => h.trim());

const data = [];

for(let i=1;i<lines.length;i++){

    const values = lines[i]
        .split(",")
        .map(v => v.trim());

    const row = {};

    headers.forEach((header,index)=>{

        let value = values[index];

        if(!isNaN(value) && value !== ""){
            value = Number(value);
        }

        row[header] = value;

    });

    data.push(row);
}

return data;

}
