const SENDFILTER_KEY="net.xzer.sendfiler.enable";
const SENDFILTER_LOGGING_KEY="net.xzer.sendfiler.logging.enable";

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

function SendFilter_runFilter(folderURI)
{
	var logger = new SendFilter_Logger("SendFilter_runFilter()");
	
	logger.trace("Begin SendFilter_runFilter(), folderURI = " + folderURI);

	var rdf = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
	var resource = rdf.GetResource(folderURI);
	var msgFolder = resource.QueryInterface(Components.interfaces.nsIMsgFolder);

	logger.trace("Get message folter " + msgFolder);

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