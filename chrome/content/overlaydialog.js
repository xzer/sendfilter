var SendFilter_EditHandler = {
	onLoad: function() {

  		var logger = new SendFilter_Logger("SendFilter_EditHandler.onLoad()");

		//move the checkbox to the correct place,because we have no the id which
		//we want to insert before...
		var ck = document.getElementById("sendfilter-ck");

		logger.trace("get ck " + ck);

/*
		var oWindow = ck.parentNode;
		if (oWindow){
			oWindow.removeChild(ck);
		}
		var tar = oWindow.childNodes.item(7);
		oWindow.insertBefore(ck,tar);
*/


	  	var el = document.getElementById("serverMenu").parentNode.nextSibling;
		if (el){
			el.parentNode.insertBefore(ck,el);
 		}

		logger.trace("ck inserted.");
		
		//retriew the setting value
		if (SendFilter_isFilterEnable()) {
			ck.checked = true;
		}else{
			ck.checked = false;
		}

		logger.trace("ck status is " + ck.checked);
		logger.release();
  },

	onChecked: function() {
		var logger = new SendFilter_Logger("SendFilter_EditHandler.onChecked()");
		
		var ck = document.getElementById("sendfilter-ck");
		SendFilter_setFilterEnable(!ck.checked);//be sure that this onclick event occured before the status changing
		
		logger.trace("set chk to " + !ck.checked);
		logger.release();
	  }
};

window.addEventListener("load", function(e) { SendFilter_EditHandler.onLoad(e);}, false); 
