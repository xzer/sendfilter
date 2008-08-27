var SendFilter_EditHandler = {
  onLoad: function() {
  	//move the checkbox to the correct place,because we have no the id which
  	//we want to insert before...
  	var ck = document.getElementById("sendfilter-ck");
		var oWindow = ck.parentNode;
		if (oWindow){
			oWindow.removeChild(ck);
		}
		var tar = oWindow.childNodes.item(7);
		oWindow.insertBefore(ck,tar);
		
		//retriew the setting value
		if (SendFilter_isFilterEnable()) {
			ck.checked = true;
		}else{
			ck.checked = false;
		}
  },

  onChecked: function() {
  	var ck = document.getElementById("sendfilter-ck");
  	SendFilter_setFilterEnable(!ck.checked);//be sure that this onclick event occured before the status changing
  }
};

window.addEventListener("load", function(e) { SendFilter_EditHandler.onLoad(e);}, false); 
