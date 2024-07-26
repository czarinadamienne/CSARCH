function pow2(x){
    return x > 0 && (x & (x - 1)) === 0;
}

function convbin(dec, bits){ //covert to binary
    let bin = dec.toString(2);

    while (bin.length < bits){
        bin = '0' + bin;
    }

    if (bin.length > bits){
        bin = bin.slice(-bits);
    }

    return bin;
}

function getset(bin, addnum){ //get the set from address
    let first = 0;
    let s = '';

    addnum.forEach(len => {
        let last = first + len;
        s = bin.slice(first, last);
        first = last;
    });

    return s;
}

function gettag(bin, tag){ //get the tag from address
    let first = 0;
    let tt = '';

        let last = first + tag;
        tt = bin.slice(first, last);
        first = last;

    return tt;
}

let block; //block size
let set; //set size per block
let mmn; //memory size value
let mm; //memory type (if block/word)
let cmn; //cache memory size value
let cm; //cache type (if block/word)
let pmn; //program flow input 
let pf; //program flow type(if block/word)
let catn; //cache access time
let matn; //memory access time
let pfnarr; //array to store the pmn
let t; //tag (n-k-w bits)
let s; //set (k bits)
let w; //word (w bits)

document.getElementById("sub").onclick = function(event){
    event.preventDefault();
    block = parseInt(document.getElementById("block").value);
    set = parseInt(document.getElementById("set").value);
    mmn = parseInt(document.getElementById("mmn").value);
    mm = document.getElementById("mm").value;
    cmn = parseInt(document.getElementById("cmn").value); 
    cm = document.getElementById("cm").value; 
    pmn = document.getElementById("pmn").value;
    pf = document.getElementById("pf").value;
    
    function alertError(message) {
        const errorMessage = document.getElementById("error-message");
        errorMessage.innerText = message;
        errorMessage.classList.add("visible");
    }

    if(!pow2(block) || !pow2(set) || !pow2(mmn) || !pow2(cmn)){
        alertError("Inputs should be a power of 2!"); 
        document.getElementById("block").value = '';
        document.getElementById("set").value = '';
        document.getElementById("mmn").value = '';
        return;
    }

    if(block <= 0 || set <= 0 || mmn <= 0 || cmn <= 0){
        alertError("Inputs should be greater than 0!"); 
        document.getElementById("block").value = '';
        document.getElementById("set").value = '';
        document.getElementById("mmn").value = '';
        document.getElementById("cmn").value = '';
        return;
    }

    if(cmn % set || cmn < set){
        alertError("Cache size should be greater than and divisible by set size!");
        document.getElementById("set").value = '';
        document.getElementById("cmn").value = '';
        return;
    }

    pfnarr = pmn.split(' ').map(Number); // to store in array

    for (let i = 0; i < pfnarr.length; i++) {
        let btest = (mm === "bmm") ? mmn * block : mmn;

        if (btest < pfnarr[i]) {
            alertError("Program flow value should be less than or equal to the MM memory size!");
            document.getElementById("pmn").value = '';
            pfnarr = [];
            btest = 0;
            return;
        }
    }

    document.getElementById("print").disabled = false;
        let numset; //total sets
        let inds = 0;
        let word;
        let fset;   
        let tag;
        let addval;
        let totb;
        let s;
        let addnum = []; //stores tag and set
        let pfpairs = []; //to store value and its set

        if(block * set !== cmn){
            set = cmn / set;
        }

        if(cm === "cmb"){
            numset = cmn / set;
            fset = Math.log2((cmn / set));
        }
        else if(cm === "cmw"){
            numset = cmn / block;
            fset = Math.log2(((cmn / block) / set));
        }

        word = Math.log2(block);

        if(mm === "wmm"){
            tag = Math.log2(mmn) - fset - word;
        }
        else if(mm === "bmm"){ 
            tag = Math.log2((mmn * block)) - fset - word;
        }
        addnum.push(tag);
        addnum.push(fset);
        console.log(tag);
        console.log(fset);
        console.log(word);
        totb = tag + fset + word;

        //to check if word or block
        if (pf === "pfw"){
            pfpairs = pfnarr.map(num => {
                addval = convbin(num, totb);
                s = getset(addval, addnum);
                setNumber = parseInt(s, 2);
                t = gettag(addval, tag);
                return [num, setNumber, t];
            });
        }
        else if (pf === "pfb"){
            numset = cmn / set;
            pfpairs = pfnarr.map(num => {
                addval = convbin(num, totb);
                let setNumber = num % set;
                t = gettag(addval, tag);
                return [num, setNumber, t];
            });
        }

        let j;
        let hit = 0;
        let miss = 0;
        let value;
        let tagval;
        //stores the value computed value
        let cache = Array.from({ length: set }, () => Array.from({ length: numset }, () => null));
        let lastind = Array(set).fill(-1); //stores the last index used

        pfpairs.forEach(function(pair){ //mru
            value = pair[0]; //get val
            inds = pair[1]; //get set    
            tagval = pair[2]; //get tag
            for(j = 0; j < cache[inds].length; j++){ //j is block
                if (cache[inds][j] === value){ //if value is found
                    lastind[inds] = j;
                    hit++;
                    break;
                }
                else if(cache[inds][j] === null){  //if value is null (start)
                    cache[inds][j] = value;
                    lastind[inds] = j;
                    miss++;
                    break;
                }
            }
            
                if (cache[inds].every(val => val != value)){ //if all have value, store in last index
                    cache[inds][lastind[inds]] = value;
                    miss++;
                }
        }); 

        catn = 1;
        matn = 10;

        let missp = catn + (block * matn) + catn;
        let avemmtime = (hit/pfnarr.length)*catn + (miss/pfnarr.length)*missp;
        let totmmtime = (hit*block*catn) + (miss*block*(catn+matn)) + (miss*catn);

        document.getElementById("hits").textContent = hit;
        document.getElementById("misses").textContent = miss;
        document.getElementById("missp").textContent = missp;
        document.getElementById("avemmtime").textContent = avemmtime;
        document.getElementById("totmmtime").textContent = totmmtime;

        function populateTable(cache) {
            const tableBody = document.getElementById("cacheBody");
            tableBody.innerHTML = "";
        
            const blockNumbers = cache[0].length; 
        
            const header = document.createElement("tr");
            header.innerHTML = `<th>Set</th>${Array.from({ length: blockNumbers }, (_, i) => `<th>Block ${i + 1}</th>`).join("")}`;
            const tableHead = document.querySelector("#cacheTable thead");
            tableHead.innerHTML = "";
            tableHead.appendChild(header);
        
            cache.forEach((set, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `<td>${index}</td>${set.map(block => `<td>${block !== null ? block : ''}</td>`).join("")}`;
                tableBody.appendChild(row);
            });
        }
        
    
        populateTable(cache); //to display table values

    const errorMessage = document.getElementById("error-message");
    errorMessage.innerText = '';
    errorMessage.classList.remove("visible");

};


function downloadText() {
    const hits = document.getElementById("hits").textContent;
    const misses = document.getElementById("misses").textContent;
    const missp = document.getElementById("missp").textContent;
    const avemmtime = document.getElementById("avemmtime").textContent;
    const totmmtime = document.getElementById("totmmtime").textContent;

    let text = `Results:\n\n`;
    text += `Hits: ${hits}\n`;
    text += `Misses: ${misses}\n`;
    text += `Miss Penalty: ${missp}\n`;
    text += `Average Memory Access Time: ${avemmtime}\n`;
    text += `Total Memory Access Time: ${totmmtime}\n\n`;

    text += `Cache State:\n`;
    const table = document.getElementById("cacheTable");
    const rows = table.querySelectorAll("tbody tr");
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        cells.forEach((cell, index) => {
            text += (index > 0 ? ' ' : '') + cell.textContent;
        });
        text += '\n';
    });

    return text;
}

document.getElementById("print").addEventListener("click", function() {
    const textContent = downloadText();
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "cachesimresult.txt";
    a.click();
    
    URL.revokeObjectURL(url);
});

document.getElementById("clear").onclick = function(event){
    event.preventDefault();
    document.getElementById("block").value = '';
    document.getElementById("set").value = '';
    document.getElementById("mmn").value = '';
    document.getElementById("cmn").value = '';
    document.getElementById("pmn").value = '';
    block = 0;
    set = 0;
    mmn = 0;
    cmn = 0;
    pmn = 0;
    pfnarr = [];
    addnum = [];
    pfpairs = [];
    inds = 0;
    hit = 0;
    miss = 0;
    value = 0;
    numset = 0;
    document.getElementById("hits").textContent = '';
    document.getElementById("misses").textContent = '';
    document.getElementById("missp").textContent = '';
    document.getElementById("avemmtime").textContent = '';
    document.getElementById("totmmtime").textContent = '';
    const tableBody = document.getElementById("cacheBody");
    const tableHead = document.querySelector("#cacheTable thead");

    tableBody.innerHTML = "";
    tableHead.innerHTML = `
        <tr>
            <th>Set</th>
            <th>Block/s</th>
        </tr>`;
    document.getElementById("print").disabled = true;
}