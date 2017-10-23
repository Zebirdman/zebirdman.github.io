'use strict';
// the permutation arrays to be passed to functions
var IP = [2,4,9,8,15,7,6,0,13,11,1,12,3,10,5,14];
var IP_1 = [7,10,0,12,1,14,6,5,3,2,13,9,11,8,15,4];
var EP = [4,6,2,1,7,3,5,0,0,5,3,7,1,2,6,4];
var P8 = [1,5,2,0,3,4,7,6];
var P20 = [4,1,8,11,0,18,9,2,7,10,6,16,3,14,5,19];
var P16 = [10,1,12,7,8,13,5,9,15,0,4,11,2,6,14,3];
var SLL1 = [1,2,3,4,5,6,7,0];
var SLR1 = [9,10,11,12,13,14,15,8];
var SLL2 = [2,3,4,5,6,7,0,1];
// arrays for splitting and quartering arrays in the permute function
var H1 = [0,1,2,3,4,5,6,7];
var H2 = [8,9,10,11,12,13,14,15];
var Q1 = [0,1,2,3];
var Q2 = [4,5,6,7];
var Q3 = [8,9,10,11];
var Q4 = [12,13,14,15];

$(document).ready(function() {

  $("#calculate").click(function() {
    var txt = $("#plain-input").val();
    var key = $("#key-input").val();
    var txtValid = validate(txt, "Plain text");
    var keyValid = validate(key, "Key");
    if(txtValid && keyValid) {
      encrypt();
    }
  });
  $("#default").click(function() {
    $("#plain-input").val('1010101010101010');
    $("#key-input").val('11111000001100100011');
  });
});
/**
* validates a given input to within range and ensures it is binary
*/
function validate(input, message) {
  var len = 16;
  if(message == "Key") {
    len = 20;
  }
  if(input.length < len) {
    $("#error-mes").html('Message: ' + message + ' must be ' + len + ' long');
    return false;
  }
  for(var i = 0; i < input.length; i++) {
    var char = input.charAt(i);
    if(!(parseInt(char) == 1 || parseInt(char) == 0)) {
      $("#error-mes").html('Message: ' + message + ' can only contain 1\'s or 0\'s');
      return false;
    }
  }
  return true;
}
/**
* this starts the encryption process, calls each function as needed as using timed delays to
* achieve the staged output seen on the screen
*/
function encrypt() {
  // permute and reduce key
  var keyStart = $("#key-input").val().split("");
  var key = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  key = permute(keyStart, key, P20, $("#P-20"));

  // left shift one, left side of key
  var leftKeyBits1 = [0,0,0,0,0,0,0,0];
  setTimeout(function(){
    leftKeyBits1 = permute(key, leftKeyBits1, SLL1, $("#LS-1-1"));
  }, 500);

  // left shift one right side of key
  var rightKeyBits1 = [0,0,0,0,0,0,0,0];
  setTimeout(function(){
    rightKeyBits1 = permute(key, rightKeyBits1, SLR1, $("#LS-1-2"));
  }, 1000);

  // permute the key by P16 to create our first key for XOR operation
  var key1 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  setTimeout(function() {
    var joinedKeyHalves1 = join(leftKeyBits1, rightKeyBits1);
    key1 = permute(joinedKeyHalves1, key1, P16, $("#P-16-1"));
  }, 1500);

  // left shift two, left side of key
  var leftKeyBits2 = [0,0,0,0,0,0,0,0];
  setTimeout(function(){
    leftKeyBits2 = permute(leftKeyBits1, leftKeyBits2, SLL2, $("#LS-2-1"));
  }, 2000);

  // left shift two right side of key
  var rightKeyBits2 = [0,0,0,0,0,0,0,0];
  setTimeout(function(){
    rightKeyBits2 = permute(rightKeyBits1, rightKeyBits2, SLL2, $("#LS-2-2"));
  }, 2500);

  // permute the key by P16 to create our first key for XOR operation
  var key2 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  setTimeout(function() {
    var joinedKeyHalves2 = join(leftKeyBits2, rightKeyBits2);
    key2 = permute(joinedKeyHalves2, key2, P16, $("#P-16-2"));
  }, 3000);

  // ----------------------------------- the text functions here ---------------------------------------- //

  // initialPermutation
  var textStart = $("#plain-input").val().split("");
  var text = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  setTimeout(function(){
    text = permute(textStart, text, IP, $("#R1-IP"));
  }, 3500);

  // expand and permute message
  var expandPermute = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  var messageLeftBits = [0,0,0,0,0,0,0,0];
  var messageRightBits = [0,0,0,0,0,0,0,0];
  setTimeout(function(){
    messageLeftBits = permute(text, messageLeftBits, H1);
    messageRightBits = permute(text, messageRightBits, H2);
    expandPermute = permute(messageRightBits, expandPermute, EP, $("#R1-EP"));
  }, 4000);

  // exclusive or with current message and the first key
  var xorResult = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  setTimeout(function(){
    xorResult = exclusiveOr(expandPermute, key1, xorResult, 16, $("#R1-XOR-16"));
  }, 4500);

  // calculate s box results, each is a string of two binary letters and each result
  // is then concatenated on to the last to create a final binary string that is then split
  // to create an array
  var sboxResult;
  setTimeout(function(){
    setTimeout(function() {
      sboxResult = sBox(xorResult, 1, 1, Q1);
    }, 70);
    setTimeout(function() {
      sboxResult = sboxResult.concat(sBox(xorResult, 1, 2, Q2));
    }, 140);
    setTimeout(function() {
      sboxResult = sboxResult.concat(sBox(xorResult, 1, 3, Q3));
    }, 210);
    setTimeout(function() {
      sboxResult = sboxResult.concat(sBox(xorResult, 1, 4, Q4));
    }, 280);
    setTimeout(function() {
      sboxResult = sboxResult.split("");
    }, 350);
  }, 5000);

  // permute the s box results
  var permute8 = [0,0,0,0,0,0,0,0];
  setTimeout(function(){
    text = permute(sboxResult, permute8, P8, $("#R1-P8"));
  }, 5500);

  // exclusive or with s box result and left have of message
  var xor8Result = [0,0,0,0,0,0,0,0];
  setTimeout(function(){
    xor8Result = exclusiveOr(messageLeftBits, permute8, xor8Result, 8, $("#R1-XOR-8"));
  }, 6000);

  // switch the message halves
  var switchedHalves = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  setTimeout(function(){
    switchedHalves = join(messageRightBits, xor8Result);
    cycleThrough($("#switch"), switchedHalves, 0, 16);
  }, 6500);

  // expand and permute message
  setTimeout(function(){
    messageLeftBits = permute(switchedHalves, messageLeftBits, H1);
    messageRightBits = permute(switchedHalves, messageRightBits, H2);
    expandPermute = permute(messageRightBits, expandPermute, EP, $("#R2-EP"));
  }, 7000);

  // exclusive or with current message and the first key
  setTimeout(function(){
    xorResult = exclusiveOr(expandPermute, key2, xorResult, 16, $("#R2-XOR-16"));
  }, 7500);

  // calculate s box results, each is a string of two binary letters and each result
  // is then concatenated on to the last to create a final binary string that is then split
  // to create an array
  setTimeout(function(){
    setTimeout(function() {
      sboxResult = sBox(xorResult, 2, 1, Q1);
    }, 70);
    setTimeout(function() {
      sboxResult = sboxResult.concat(sBox(xorResult, 2, 2, Q2));
    }, 140);
    setTimeout(function() {
      sboxResult = sboxResult.concat(sBox(xorResult, 2, 3, Q3));
    }, 210);
    setTimeout(function() {
      sboxResult = sboxResult.concat(sBox(xorResult, 2, 4, Q4));
    }, 280);
    setTimeout(function() {
      sboxResult = sboxResult.split("");
    }, 350);
  }, 8000);

  // permute the s box results
  setTimeout(function(){
    text = permute(sboxResult, permute8, P8, $("#R2-P8"));
  }, 8500);

  // exclusive or with s box result and left have of message
  setTimeout(function(){
    xor8Result = exclusiveOr(messageLeftBits, permute8, xor8Result, 8, $("#R2-XOR-8"));
  }, 9000);

  // inverse permutation
  var cipherText = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  setTimeout(function(){
    cipherText = permute(join(xor8Result, messageRightBits), cipherText, IP_1, $("#IP"));
  }, 9500);
  setTimeout(function(){
    $("#cipher-result").val(cipherText.join(''));
  }, 10000);
}
/**
* handles the selection and return of one s boxes results
*/
function sBox(input, round, box, p) {
  var boxInput = [0,0,0,0];
  boxInput = permute(input, boxInput, p);
  var row = getValue(boxInput[0], boxInput[3]);
  var col = getValue(boxInput[1], boxInput[2]);
  var current = $("#R"+round+"-S"+box+"-R"+row).children("[name="+col+"]");
  current.addClass("red");
  return getBinaryValue(current.html());
}
/**
* gets the numeric value of two binary inputs
*/
function getValue(input1, input2) {
  if(input1 == 0 && input2 == 1) {
    return 1;
  } else if(input1 == 1 && input2 == 0) {
    return 2;
  } else if(input1 == 1 && input2 == 1) {
    return 3;
  } else {
    return 0;
  }
}
/**
* gets the binary value of a numeric input
*/
function getBinaryValue(input) {
  if(input == 3) {
    return "11";
  } else if(input == 2) {
    return "10";
  } else if(input == 1) {
    return "01";
  } else {
    return "00";
  }
}

/**
* joins two arrays together returning a new array
*/
function join(arrayOne, arrayTwo) {
  var temp = arrayOne.concat(arrayTwo);
  return temp;
}
/**
* creates a permutation of an input array and stores this in a second array
* the permutation is recieved an an array of array indices, the target is the
* html element where the results will be displayed
*/
function permute(input, temp, p, target) {
  for(var i = 0; i < temp.length; i++) {
    temp[i] = input[p[i]];
  }
  if(target) {
    cycleThrough(target, temp, 0, temp.length+1);
  }
  return temp;
}

/**
* performs a exclusive or operation on two arrays, assigns result to new array
*/
function exclusiveOr(input, ky, temp, limit, target) {
  for(var i = 0; i < input.length; i++) {
    if(input[i] == ky[i]) {
      temp[i] = 0;
    } else {
      temp[i] = 1;
    }
  }
  cycleThrough(target, temp, 0, limit);
  return temp;
}

/**
* a timing function that will allocate values to an html array of elements, uses a recursive
* approach to enable a timed delay to work properly.
*/
function cycleThrough(target, input, index, limit) {
  var interval = 500/limit;
  setTimeout(function () {
     $(target).children("[name="+index+"]").html(input[index]);
     index++;
     if(index < limit) {
       cycleThrough(target, input, index, limit);
     }
   }, interval);
}
