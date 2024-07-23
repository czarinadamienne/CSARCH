//function to get exponent of power of 2
function powerTwo(n) {
    if(n <= 0 || (n & (n - 1)) !== 0) {
        throw new Error("Invalid input, please input power of 2.")
    }
    
    return Math.log2(n);
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
    catn = 1;
    
    pfnarr = pmn.split(' ').map(Number);//to store in array
    let inds = 0;
    let word;
    let fset;
    let tag;
    let addval;
    let totb;
    let s;
    let addnum = [];
    let pfpairs = [];

    //to check if word or block
    if (pf === "pfw"){
        if(cm === "cmb"){
            fset = powerTwo((cmn / set));
        }
        else if(cm === "cmw"){
            fset = powerTwo(((cmn / block) / set));
        }

        word = powerTwo(block);

        if(mm === "wmm"){ //not sure
            tag = powerTwo(mmn) - fset - word;
        }
        else if(mm === "bmm"){
            tag = powerTwo((mmn * block)) - fset - word;
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

    pfpairs.forEach(function(pair){
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

    matn = parseFloat(document.getElementById("matn").value);

    let missp = catn + (block * matn) + catn; //idk if cache access time or just 1
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

    //error checking with num inputs
    //check the memory size, cache memory calculations
    //print output
    //export to txt
}