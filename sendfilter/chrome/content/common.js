const SENDFILTER_KEY="net.xzer.sendfiler.enable";
const SENDFILTER_LOGGING_KEY="net.xzer.sendfiler.logging.enable";
const SENDFILTER_FOLDERPER="SendFilter_WaitForListener";
const SENDFILTER_FOLDERPER_WAITLOAD="1";
const SENDFILTER_FOLDERPER_LOADED="2";

var SendFilter_PrefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);
var SendFilter_Console = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService)

var SendFilter_LoggerCounter = 0;
var SendFilter_LoggerString = "";

function SendFilter_Logger(p){

	//this.id = (SendFilter_LoggerId++) + 1;
	this.id = p;

	this.isEnable = SendFilter_isLoggingEnable();
	
	//this.logstr = "Send Filter Log(" + p + ") - " + this.id + "\n";

	//this.logstr = "Send Filter Log\n";

	SendFilter_LoggerCounter++;

	this.trace = function(s){
		if (this.isEnable)
		{
			SendFilter_LoggerString += "\t(" + this.id + ")  " + s + "\n";
		}
	}

	this.release = function(){
		SendFilter_LoggerCounter--;
		if (this.isEnable)
		{
			if (SendFilter_LoggerCounter == 0)
			{
				SendFilter_LoggerString = "Send Filter Log\n" + SendFilter_LoggerString;
				SendFilter_Console.logStringMessage(SendFilter_LoggerString);
				SendFilter_LoggerString = "";
			}
		}
	}

}

function SendFilter_isLoggingEnable(){
	var isEnable = false;
	try{
		isEnable = SendFilter_PrefBranch.getBoolPref(SENDFILTER_LOGGING_KEY);
	}catch(ex){
		//
	}
	return isEnable;
}

function SendFilter_setLoggingEnable(b){
	SendFilter_PrefBranch.setBoolPref(SENDFILTER_LOGGING_KEY,b);
}

function SendFilter_isFilterEnable(){
	var isEnable = false;
	try{
		isEnable = SendFilter_PrefBranch.getBoolPref(SENDFILTER_KEY);
	}catch(ex){
		//
	}
	return isEnable;
}

function SendFilter_setFilterEnable(b){
	SendFilter_PrefBranch.setBoolPref(SENDFILTER_KEY,b);
}


var SendFilter_FolderListener = {
  OnItemAdded: function(parentItem, item) {},
  OnItemRemoved: function(parentItem, item) {},
  OnItemPropertyChanged: function(item, property, oldValue, newValue) {},
  OnItemIntPropertyChanged: function(item, property, oldValue, newValue) {},
  OnItemBoolPropertyChanged: function(item, property, oldValue, newValue) {},
  OnItemUnicharPropertyChanged: function(item, property, oldValue, newValue){},
  OnItemPropertyFlagChanged: function(item, property, oldFlag, newFlag) {},

  OnItemEvent: function(folder, event) {
    var eventType = event.toString();
    if (eventType == "FolderLoaded") {
      if (folder) {
        var uri = folder.URI;
		// when pop3 folder, there is a component not defined error, I should refactory my source to avoid this
		// but I have no time, so just catch it simplly.
		try{
			var msgFolder = folder.QueryInterface(Components.interfaces.nsIMsgFolder);
			var waitFor = msgFolder.getStringProperty(SENDFILTER_FOLDERPER);
			if (waitFor == SENDFILTER_FOLDERPER_WAITLOAD)
			{
				msgFolder.setStringProperty(SENDFILTER_FOLDERPER, SENDFILTER_FOLDERPER_LOADED);
				SendFilter_runFilter(uri);
			}
		}catch(ex){
			//
		}
      }
	}
  }

}

//var SendFilter_mailSession = Components.classes[mailSessionContractID]
var SendFilter_mailSession = Components.classes["@mozilla.org/messenger/services/session;1"]
                                .getService(Components.interfaces.nsIMsgMailSession);
var nsIFolderListener = Components.interfaces.nsIFolderListener;
SendFilter_mailSession.AddFolderListener(SendFilter_FolderListener, Components.interfaces.nsIFolderListener.event);

function SendFilter_runFilter(folderURI)
{

	var logger = new SendFilter_Logger("SendFilter_runFilter()");
	
	logger.trace("Begin SendFilter_runFilter(), folderURI = [" + folderURI + "]");

	var rdf = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
	var resource = rdf.GetResource(folderURI);
	var msgFolder = resource.QueryInterface(Components.interfaces.nsIMsgFolder);
	
	logger.trace("Get message folter " + msgFolder);

	if (folderURI.indexOf("imap") == 0){
		logger.trace("is an imap folder");
		var waitFor = msgFolder.getStringProperty(SENDFILTER_FOLDERPER);
		logger.trace("waitFor = " + waitFor);
		if (waitFor != SENDFILTER_FOLDERPER_LOADED){
			logger.trace("loading folder from server");
			msgFolder.setStringProperty(SENDFILTER_FOLDERPER, SENDFILTER_FOLDERPER_WAITLOAD);
			msgFolder.startFolderLoading();
			msgFolder.updateFolder(msgWindow);
			logger.trace("finish SendFilter_runFilter for waiting load listener");
			logger.release();
			return;
		}
		logger.trace("imap folder loaded");
		msgFolder.setStringProperty(SENDFILTER_FOLDERPER, "");
	}


	var filterService = Components.classes["@mozilla.org/messenger/services/filters;1"].getService(Components.interfaces.nsIMsgFilterService);
	var filterList = filterService.getTempFilterList(msgFolder);

	logger.trace("Create temp filter list " + filterList);

	var folders = Components.classes["@mozilla.org/supports-array;1"].createInstance(Components.interfaces.nsISupportsArray);
	folders.AppendElement(msgFolder);

	var curFilterList = msgFolder.getFilterList(msgWindow);

	logger.trace("Get defined filter list" + curFilterList);

	// make sure the tmp filter list uses the real filter list log stream
	filterList.logStream = curFilterList.logStream;
	filterList.loggingEnabled = curFilterList.loggingEnabled;
	var numFilters = curFilterList.filterCount;

	logger.trace("Filter count is " + numFilters);

	var newFilterIndex = 0;
	for (var i = 0; i < numFilters; i++)
	{
		var curFilter = curFilterList.getFilterAt(i);
		if (curFilter.enabled && !curFilter.temporary) // only add enabled, UI visibile filters
		{
			filterList.insertFilterAt(newFilterIndex, curFilter);
			newFilterIndex++;
		}
	}

	logger.trace("Ready to fire filters " + newFilterIndex);

	filterService.applyFiltersToFolders(filterList, folders, msgWindow);

	logger.trace("Finished fire filters");
	logger.release();
}


