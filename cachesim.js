let block;
let set;
let mmn;
let mm;
let cmn;
let cm;
let pmn;
let pf;
let catn;
let cat;
let matn;
let mat;

document.getElementById("sub").onclick = function(event){
    event.preventDefault();
    block = document.getElementById("block").value;
    set = document.getElementById("set").value;
    mmn = document.getElementById("mmn").value;
    mm = document.getElementById("mm").value;
    cmn = document.getElementById("cmn").value; 
    cm = document.getElementById("cm").value; 
    pmn = document.getElementById("pmn").value;
    pf = document.getElementById("pf").value;
    catn = document.getElementById("catn").value;
    cat = document.getElementById("cat").value;
    matn = document.getElementById("matn").value;
    mat = document.getElementById("mat").value;

    //to store in array
    var pfnarr = pmn.split(' ').map(Number);
    pfnarr.forEach((value, index) => {
        console.log(`arr[${index}] = ${value}`);
    });
}


/* to do
- do conversions for block and words
- math for access time
*/