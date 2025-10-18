/*
DES Encryptor / Decryptor [CS454 : Assignment 1]
Programmer: Nicky Victoriano
CSVs transcribed by me. Run using node.
*/

const fs = require('fs');

// #region Tables

const INITIAL_PERMUTATION = [
    58,50,42,34,26,18,10,2,
    60,52,44,36,28,20,12,4,
    62,54,46,38,30,22,14,6,
    64,56,48,40,32,24,16,8,
    57,49,41,33,25,17,9,1,
    59,51,43,35,27,19,11,3,
    61,53,45,37,29,21,13,5,
    63,55,47,39,31,23,15,7,
]

const INVERSE_IP = [
    40,8,48,16,56,24,64,32,
    39,7,47,15,55,23,63,31,
    38,6,46,14,54,22,62,30,
    37,5,45,13,53,21,61,29,
    36,4,44,12,52,20,60,28,
    35,3,43,11,51,19,59,27,
    34,2,42,10,50,18,58,26,
    33,1,41,9,49,17,57,25,
]

/**
 * @type {{turns : number}}
 */
const SCHEDULE = [
    1, 1, 2, 2, 2, 2, 2, 2, 
    1, 2, 2, 2, 2, 2, 2, 1,
]

const EXPANSION_PERMUTATION = [
    32,1,2,3,4,5,
    4,5,6,7,8,9,
    8,9,10,11,12,13,
    12,13,14,15,16,17,
    16,17,18,19,20,21,
    20,21,22,23,24,25,
    24,25,26,27,28,29,
    28,29,30,31,32,1,
]

const PC_1 = [
    57,49,41,33,25,17,9,
    1,58,50,42,34,26,18,
    10,2,59,51,43,35,27,
    19,11,3,60,52,44,36,
    63,55,47,39,31,23,15,
    7,62,54,46,38,30,22,
    14,6,61,53,45,37,29,
    21,13,5,28,20,12,4,
]

const PC_2 = [
    14,17,11,24,1,5,3,28,
    15,6,21,10,23,19,12,4,
    26,8,16,7,27,20,13,2,
    41,52,31,37,47,55,30,40,
    51,45,33,48,44,49,39,56,
    34,53,46,42,50,36,29,32,
]

const PERMUTATION_FUNCTION = [
    16,7,20,21,29,12,28,17,
    1,15,23,26,5,18,31,10,
    2,8,24,14,32,27,3,9,
    19,13,30,6,22,11,4,25,
]

const SBOXES = [
    [ // S1
        [14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7],
        [0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8],
        [4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0],
        [15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13],
    ],
    [ // S2
        [15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10],
        [3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5],
        [0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15],
        [13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9],
    ],
    [ // S3
        [10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8],
        [13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1],
        [13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7],
        [1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12],
    ],
    [ //S4
        [7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15],
        [13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9],
        [10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4],
        [3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14],
    ],
    [ //S5
        [2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9],
        [14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6],
        [4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14],
        [11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3],
    ],
    [ //S6
        [12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11],
        [10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8],
        [9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6],
        [4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13],
    ],
    [ //S7
        [4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1],
        [13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6],
        [1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2],
        [6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12],
    ],
    [ //S8
        [13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7],
        [1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2],
        [7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8],
        [2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11],
    ],
]

/**
 * @typedef {object} Input
 * @property {string} dataBlock (already converted to binary)
 * @property {string} key (already converted to binary)
 * @property {bool} encryption (true: encryption | false: decryption)
 */

// #endregion

// #region Main

/**
 *  @type {string[]}
 */
const ARGS = process.argv;

/**
 * @type Input
 */
let INPUT;

// Storage for all output strings
let C_KEYS = []; // C0 - C16
let D_KEYS = []; // D0 - D16
let SUBKEYS = []; // K1 - K16
let L_HALF = []; // L0 - L16
let R_HALF = []; // R0 - R16
let OUTPUT;

readInput(); // Start //

for (let i = 0; i <= 16; i++){ // Key setup //
    if(i == 0)
        keyThroughPC1();
    else{
        shiftKey(i - 1);
        subkeyGeneration(i - 1);
    }
}

let IP = initialPermutation(); // Initial permutation //
L_HALF.push(IP.substring(0, 32));
R_HALF.push(IP.substring(32))

for (let roundIndex = 0; roundIndex < 16; roundIndex++){ // Encryption or Decryption //
    let keyIndex = INPUT.encryption ? roundIndex : (15 - roundIndex);
    let subkey = SUBKEYS[keyIndex];

    let newRight = feistelFunction(roundIndex, subkey);
    L_HALF.push(R_HALF[roundIndex]);
    R_HALF.push(manualXor(newRight, L_HALF[roundIndex]));
}

OUTPUT = inverseInitialPermutation(R_HALF[16] + L_HALF[16]); // Inverse initial permutation //

createOutput(); // End //

// #endregion

// #region Main Functions
/**
 * Reads input file. `ARGS` must be assigned.
 */
function readInput() {
    try {
        const data = fs.readFileSync(ARGS[2], 'utf8').trim();
        console.log('\nINPUT FILE:\n' + data + '\n\n---\n\n');

        let inputCommands = data.split('\n').map(line => line.trim());

        // Just assuming the file will always be formatted correctly
        INPUT = {
            dataBlock: hexToBinary(inputCommands[0]),
            key: hexToBinary(inputCommands[1]),
            encryption: inputCommands[2].includes('encryption'),
        };

    } catch (err) {
        console.error('Error reading file:', err);
    }
}

/**
 * Turns argument into a 64-bit string of binary characters.
 * @param {string} hexString String representing hexadecimal value
 * @returns {string} Padded 64-bit binary string
 */
function hexToBinary(hexString) {
    const hexMatch = hexString.match(/:\s*([0-9A-Fa-f]+)/);
    if (!hexMatch) {
        console.error("Invalid input format for hexadecimal value.");
        return "";
    }
    let hex = hexMatch[1];
    hex = hex.padStart(16, '0');
    let binaryString = '';
    for (let char of hex) {
        binaryString += parseInt(char, 16).toString(2).padStart(4, '0');
    }
    return binaryString;
}

/**
 * Converts a 64-bit binary string to a padded 16-character hex string.
 * @param {string} binaryString 64-bit binary string
 * @returns {string} Padded 16-chararacter hex string in uppercase
 */
function binaryToHex(binaryString) {
    let hex = '';
    for (let i = 0; i < 64; i += 4) {
        const chunk = binaryString.substring(i, i + 4);
        hex += parseInt(chunk, 2).toString(16);
    }
    return hex.toUpperCase().padStart(16, '0');
}

function createOutput(){
    let data = '';
    for(let i = 0; i <= 16; i++){ // C0:C16, D0:D16
        data = data + 'C' + i.toString() + '=' + C_KEYS[i] + '\n';
        data = data + 'D' + i.toString() + '=' + D_KEYS[i] + '\n';
    }
    data = data + '\n';
    for(let i = 0; i < 16; i++){ // K1:K16
        let j = INPUT.encryption ? (i) : (15 - i);
        data = data + 'K' + (i + 1).toString() + '=' + SUBKEYS[j] + '\n';
    }
    data = data + '\n';
    for(let i = 0; i <= 16; i++){ // L0:L16, R0:R16
        data = data + 'L' + i.toString() + '=' + L_HALF[i] + '\n';
        data = data + 'R' + i.toString() + '=' + R_HALF[i] + '\n';
    }
    data = data + '\n';
    data = data + 'Result=' + binaryToHex(OUTPUT);


    fs.writeFile(ARGS[3], data, (err) => {
        if (err) throw err;
        console.log('[FILE SAVED!] OUTPUT FILE:\n' + data + '\n');
    });
}

// #endregion

// #region Round 0

/**
 * Shuffles data block bits according to IP.
 * @returns {string} Shuffled padded binary string
 */
function initialPermutation(){
    let newBits = '';
    for(let index of INITIAL_PERMUTATION)
        newBits += INPUT.dataBlock[index - 1];
    return newBits;
}

/**
 * Generates first C/D-keys and adds them to `C_KEYS`\\`D_KEYS`.
 */
function keyThroughPC1(){
    let permutation = '';
    for(let index of PC_1)
        permutation += INPUT.key[index - 1];

    // Create substrings
    let C = permutation.substring(0, 28);
    let D = permutation.substring(28);
    C_KEYS.push(C);
    D_KEYS.push(D);
}

// #endregion

// #region Key Generation

/**
 * Shifts latest C/D-keys left according to `SCHEDULE[]` and pushes them to `C_KEYS`\\`D_KEYS`.
 * @param {number} roundIndex Round of keys being shifted
 */
function shiftKey(roundIndex){
    let new_C = C_KEYS[roundIndex];
    let new_D = D_KEYS[roundIndex];
    for (let i = 0; i < SCHEDULE[roundIndex]; i++){
        new_C = (new_C + new_C[0]).substring(1);
        new_D = (new_D + new_D[0]).substring(1);
    }
    C_KEYS.push(new_C);
    D_KEYS.push(new_D);
}

/**
 * Creates subkey from latest C/D-keys and adds them to `SUBKEYS[]`.
 * @param {number} roundIndex Round of keys being permuted
 */
function subkeyGeneration(roundIndex){
    let block = C_KEYS[roundIndex + 1] + D_KEYS[roundIndex + 1];
    let permutation = '';
    for(let index of PC_2)
        permutation += block[index - 1];
    SUBKEYS.push(permutation);
}

// #endregion

// #region Feistel Function

/**
 * Performs Feistel Function on latest Right block.
 * @param {string} subkey Subkey to be used in manualXor
 * @returns {string} Feistel'd right side binary string
 */
function feistelFunction(roundIndex, subkey){
    let expansion = expansionPermutation(roundIndex);
    let xor = manualXor(expansion, subkey);
    let sbox = sboxSubstitution(xor);
    return permuteFeistel(sbox);    
}

function expansionPermutation(roundIndex){
    let right = R_HALF[roundIndex];
    let permutation = '';
    for(let index of EXPANSION_PERMUTATION)
        permutation += right[index - 1];
    return permutation;
}

function manualXor(right, key){
    let xor = '';
    for(let i = 0; i < key.length; i++){ // Manual XOR (lol)
        if (key[i] == right[i])
            xor += '0';
        else
            xor += '1';
    }
    return xor;
}

function sboxSubstitution(xor){
    let block = '';
    for(let i = 0; i < 8; i++){
        let subBlock = xor.substring(i*6, i*6 + 6);
        let x = parseInt((subBlock[0] + subBlock[5]), 2);
        let y = parseInt(subBlock.substring(1, 5), 2);
        let chunk = SBOXES[i][x][y];
        let binaryChunk = chunk.toString(2);
        let paddedChunk = binaryChunk.padStart(4, '0');
        block += paddedChunk;
    }
    return block;
}

function permuteFeistel(sbox){
    let permutation = '';
    for(let index of PERMUTATION_FUNCTION)
        permutation += sbox[index - 1];
    return permutation;
}

// #endregion

// #region Inverse Initial Permutation

/**
 * Takes final block and puts it through inverse initial permutation.
 * @param {string} concatenation C[16] + D[16]
 * @returns {string} Final output.
 */
function inverseInitialPermutation(concatenation){
    let newBits = '';
    for(let index of INVERSE_IP)
        newBits += concatenation[index - 1];
    return newBits;
}

// #endregion