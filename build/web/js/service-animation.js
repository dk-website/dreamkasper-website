let index=0,dynamicShape;function onLoad(){switchText(1e3)}function switchText(e){setTimeout(()=>{dynamicShape=document.getElementById("dynamic-shape");try{dynamicShape.classList.remove("IntroText-module--isTablet--U1Uyu"),dynamicShape.classList.remove("IntroText-module--isPhone--CCNw1"),dynamicShape.classList.remove("IntroText-module--isDesktop--RnMCp")}catch(e){}try{document.getElementsByClassName("IntroText-module--active--BrW4B")[0].classList.remove("IntroText-module--active--BrW4B")}catch(t){}document.getElementsByClassName("IntroText-module--item--8jB7B")[index].classList.add("IntroText-module--active--BrW4B"),0==index?(dynamicShape.style.height="4.73022vw",dynamicShape.style.width="3.02734vw",dynamicShape.classList.add("IntroText-module--isPhone--CCNw1"),dynamicShape.style.transform=`translate3d(calc(${getAbsPosition(document.getElementById("mobile"))[1]+document.getElementById("mobile").offsetWidth-getAbsPosition(document.getElementById("parent-all"))[1]}px), 0px, 0px) translateX(0.5vw)`):1==index?(dynamicShape.style.height="5.1398vw",dynamicShape.style.width="6.83594vw",dynamicShape.classList.add("IntroText-module--isTablet--U1Uyu"),dynamicShape.style.transform=`translate3d(calc(${getAbsPosition(document.getElementById("tablet"))[1]+document.getElementById("tablet").offsetWidth-getAbsPosition(document.getElementById("parent-all"))[1]}px), 0px, 0px) translateX(0.5vw)`):(dynamicShape.style.height="5.34058vw",dynamicShape.style.width="6.83594vw",dynamicShape.style.transform=`translate3d(calc(${getAbsPosition(document.getElementById("desktop"))[1]+document.getElementById("desktop").offsetWidth-getAbsPosition(document.getElementById("parent-all"))[1]}px), 0px, 0px) translateX(0.5vw)`,dynamicShape.classList.add("IntroText-module--isDesktop--RnMCp")),2==index?index=0:index++,switchText()},e??3e3)}onLoad();const getAbsPosition=function(e){var t=e,a=0,s=0;if(document.getElementById||document.all)do for(s+=e.offsetLeft-e.scrollLeft,a+=e.offsetTop-e.scrollTop,e=e.offsetParent,t=t.parentNode;t!=e;)s-=t.scrollLeft,a-=t.scrollTop,t=t.parentNode;while(e.offsetParent);else document.layers&&(a+=e.y,s+=e.x);return[a,s]};