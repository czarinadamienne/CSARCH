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

let block; //block size
let set; //set size
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
        document.getElementById("error-message").innerText = message;
    }

    if(!pow2(block) || !pow2(set) || !pow2(mmn) || !pow2(cmn)){
        alertError("Inputs should be a power of 2!"); //make this appear on the front instead
        document.getElementById("block").value = '';
        document.getElementById("set").value = '';
        document.getElementById("mmn").value = '';
        document.getElementById("cmn").value = '';
        return;
    }

    else if(block <= 0 || set <= 0 || mmn <= 0 || cmn <= 0){
        alertError("Inputs should be greater than 0!"); //make this appear on the front instead
        document.getElementById("block").value = '';
        document.getElementById("set").value = '';
        document.getElementById("mmn").value = '';
        document.getElementById("cmn").value = '';
        return;
    }

    else if(cmn % set || cmn < set){
        alertError("Cache size should be greater than and divisible by set size!"); //make this appear on the front instead
        document.getElementById("set").value = '';
        document.getElementById("cmn").value = '';
        return;
    }

    
    else{
        pfnarr = pmn.split(' ').map(Number);//to store in array
        let inds = 0;
        let word;
        let fset;
        let tag;
        let addval;
        let totb;
        let s;
        let addnum = []; //stores tag and set
        let pfpairs = []; //to store value and its set

        //to check if word or block
        if (pf === "pfw"){
            if(cm === "cmb"){
                fset = Math.log2((cmn / set));
            }
            else if(cm === "cmw"){
                fset = Math.log2(((cmn / block) / set));
            }

            word = Math.log2(block);

            if(mm === "wmm"){ //not sure
                tag = Math.log2(mmn) - fset - word;
            }
            else if(mm === "bmm"){
                tag = Math.log2((mmn * block)) - fset - word;
            }
            addnum.push(tag);
            addnum.push(fset);
            totb = tag + fset + word;
            
            pfpairs = pfnarr.map(num => {
                addval = convbin(num, totb);
                s = getset(addval, addnum);
                setNumber = parseInt(s, 2);
                console.log(setNumber);
                return [num, setNumber];
            });
        }
        else if (pf === "pfb"){
            pfpairs = pfnarr.map(num => {
                let setNumber = num % set;
                return [num, setNumber];
            });
        }
        
        let j;
        let hit = 0;
        let miss = 0;
        let value;
        let cache = Array.from({ length: set }, () => Array.from({ length: block }, () => null));
        let lastind = Array(set).fill(-1);

        pfpairs.forEach(function(pair){ //mru
            value = pair[0]; //get val
            inds = pair[1]; //get set    
            for(j = 0; j < cache[inds].length; j++){ //j is block
                if (cache[inds][j] === value){ //if value is found
                    lastind[inds] = j;
                    hit++;
                    console.log(lastind[inds]);
                    break;
                }
                else if(cache[inds][j] === null){  //if value is null (start)
                    cache[inds][j] = value;
                    lastind[inds] = j;
                    miss++;
                    console.log(lastind[inds]);
                    break;
                }
            }
            
                if (cache[inds].every(val => val != value)){ //if all have value, store in last index
                    cache[inds][lastind[inds]] = value;
                    miss++;
                    console.log(lastind[inds]);
                }
        }); 

        catn = 1;
        matn = 10;

        let missp = catn + (block * matn) + catn;
        let avemmtime = (hit/pfnarr.length)*catn + (miss/pfnarr.length)*missp;
        let totmmtime = (hit*block*catn) + (miss*block*(catn+matn)) + (miss*catn);

        for (i = 0; i < set; i++){
            for (j = 0; j < block; j++){
                console.log(cache[i][j]);
            }
        }
        console.log(hit);
        console.log(miss);
        console.log(missp);
        console.log(avemmtime);
        console.log(totmmtime);
        console.log(cache);

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

    };

    //check the memory size, cache memory calculations
    //do smthn about the cache size (cuz u gotta follow dat)
    //print output: hit, miss, missp, avemmtime, totmmtime, cache final look
    //export to txt

    document.getElementById("error-message").innerText = '';

    
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
    a.download = "edit_this_file_name_nalang.txt"; // <--- EDIT THIS
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
}