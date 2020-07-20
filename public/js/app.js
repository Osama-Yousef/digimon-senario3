// for the hidden form in the result page

$('.form').hide();
$('.show').on('click',function(){

$(this).siblings().toggle(); // form and button is in the same div , so they are siblings to each other , so this line means that it will toggle just the sibling for thissss button which is the form for just this elementttt

})
//////////////////////
// for the hidden form in details page 
//////////

$('.detForm').hide();
$('.showing').on('click',function(){

$(this).siblings().toggle();
})
