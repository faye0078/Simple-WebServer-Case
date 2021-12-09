/*
 * UI enhancement script
 * for YouTypeItWePostIt.com
 * 2012-11 (@mamund)
 * RESTful Web APIs (Richardson/Amundsen)
 */

// uses bootstrap for styling
window.onload = function() {
    var elm, coll, i, x;
    
    // style the body
    elm = document.getElementsByTagName('div')[0];
    if(elm) {elm.className = 'hero-unit';}
    
    // style the nav links
    coll = document.getElementsByTagName('a');
    for(i=0, x=coll.length; i<x;i++) {
      if(coll[i].parentNode.className==='links') {
        coll[i].className = 'btn btn-primary btn-large';
      }
    }
   
    // style the message details
    elm = document.getElementsByTagName('dl')[0];
    if(elm) {elm.className='dl-horizontal'};
    
    // style the input form
    elm = document.getElementsByTagName('form')[0];
    if(elm) {elm.className='form-inline';}
    
    coll = document.getElementsByTagName('input');
    for(i=0, x=coll.length; i<x; i++) {
      if(coll[i].getAttribute('type')==='submit') {
        coll[i].className='btn';
      }
    }
  }

function verify(ID) {
  switch (ID) {
    case "name":
      var nameRule = /^[\u4E00-\u9FA5]{1,6}$/;
      reg("name", nameRule);
      break;

    case stuid:
      var identityCardRule = /^\d{13}$/;
      reg("stuid", identityCardRule);
      break;

    case mail:
      var emailRule = /^[A-z0-9]+@[a-z0-9]+.com$/;
      reg("mail", emailRule);
      break;

    case tel:
      var cellPhoneRule = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
      reg("tel", cellPhoneRule);
      break;
    
    case interest:
      var interestRule = /^[\u4E00-\u9FA5]{1,32}$/;
      reg("interest", interestRule);
      break;

    default:
      alert("操作错误！请关闭网页")
      break;
  }
}

function OnClick(){			
  var a = document.getElementsByTagName("span");
  var str = "";		
  for (var i = 0; i < a.length; i++) {		
    str+=a[i].innerText;				
  }	
  if(str == "√√√√√"){
    document.getElementById("myForm").submit();
  }else{
    alert("输入错误");
  }
}

function reg(eleId,rule){

  //动态的添加一个消息显示标签
  var inputValue = document.getElementById(eleId).value;
  var result = rule.test(inputValue.trim());
  if(result && inputValue != ""){
    document.getElementById(eleId+"_bar").innerHTML="√";
    document.getElementById(eleId+"_bar").style.color="green";
  }else{
    document.getElementById(eleId+"_bar").innerHTML="×";
    document.getElementById(eleId+"_bar").style.color="red";
  }
  
}

