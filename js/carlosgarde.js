"use strict";
//IIFE pattern
(function carlosgardetest(){ 
	
	//create a JS object with the var and methods availables
	//Revealing pattern module
	var qustodioTest = (function (window, undefined) {
	    /// PRIVATE VARS ///
	    
	    var _aFavCities = [];
	    var _oCitiesFoundSection = $('#citiesFoundSection');
	    var _oFavouritesCitiesSection = $('#favouritesCitiesSection'); 	
	    var _oInputCityByUser = $('input');
	   	var _oSearchCityBtn = $('#searchCityButton');	
	    var _nMinCitySearchChars = 3;    
	   	var _sCacheKey = 'qustodioFavCities';
	   	var _sIconBlackTpl = '<i class="fa fa-star"></i>';
	   	var _sIconWhiteTpl = '<i class="fa fa-star-o"></i>';
	    var _sSearchById = 'id';
	    var _sSearchByCityName = 'name';


	    /// PRIVATE FUNCTIONS ///

	    function _addFavToCache(nCityId){
	    	_aFavCities.push(nCityId);
	    	_saveToCache();
	    }


	    function _addRemoveToFavListener(oCity, container){
	    	if (typeof oCity !== "undefined") {
		    	$('*[data-city-id="'+ oCity.id +'"] i', container).on('click', function(){
		    			var icon = $(this);
		    			var cityId = icon.parent().data('city-id');

		    			if (icon.hasClass('fa-star-o')){
		    				icon.removeClass('fa-star-o').addClass('fa-star');
		    				_addFavToCache(oCity.id);
		    				_drawFavCity(oCity, _oFavouritesCitiesSection);
		    			}
		    			else if(icon.hasClass('fa-star')){
		    				icon.removeClass('fa-star').addClass('fa-star-o');
		    				_removeFavorite(oCity, _oFavouritesCitiesSection);
		    			}
		    		});
	   		 }
	    }


	    function _createTpl(oCity, container, sIcon){
	    		var sCityWeatherInfo = oCity.name + ', ' + oCity.sys.country + ' -- T' + Math.round(oCity.main.temp) +'º';
	    		var sTpl = '<div data-city-id="' + oCity.id + '"><span class="cityName">' + sCityWeatherInfo + '</span>'+ sIcon +'</div>';

	    		container.append(sTpl);
	    }


	    function _drawCitiesResults(oCities, container){
	    	container.empty();
	    	oCities.list.forEach(function(oCity){
	    		_createTpl(oCity, container, _sIconWhiteTpl);
	    		_addRemoveToFavListener(oCity, _oCitiesFoundSection);
	    	});
	    }


	    function _drawFavCity(oCity, container){
			_createTpl(oCity, container, _sIconBlackTpl);
			_removeFromFavListener(oCity, container);
	    }


	    function _getCacheData() {
	    	if (localStorage[_sCacheKey] !== undefined) {
	    		return JSON.parse(localStorage[_sCacheKey]);
	    	}
	    	else {
	    		return [];
	    	}
	    }


	    function _getCityWeatherInfo(sCityName) {
	    	_getData(sCityName, _sSearchByCityName, function(oCities){
	    		_drawCitiesResults(oCities,_oCitiesFoundSection);
	    	});
	    }


	    function _getFavCities(){
	    	_aFavCities = _getCacheData();

	    	if (_aFavCities !== undefined && _aFavCities !== null && _aFavCities.length >0 ){
	    		var oCity = {};
	    		var aFavCities = [];

	    		_aFavCities.forEach(function(nCityId){
	    			_getData(nCityId, _sSearchById, function(oCity){
	    				_drawFavCity(oCity, _oFavouritesCitiesSection)
	    			});
	    		});
	    	}

	    }


	    function _getData(sCityToSearch, typeOfSearch, callback){
	    	var sUrl = '';
	    	var sMetric = '&units=metric';

	    	if (typeOfSearch === _sSearchById){
	    		sUrl = 'http://api.openweathermap.org/data/2.5/weather?id=';
	    	}
	    	else if (typeOfSearch === _sSearchByCityName) {
				sUrl = 'http://api.openweathermap.org/data/2.5/find?q=';
	    	}

	    	if (sUrl !== ''){
			    $.ajax({
			         url: sUrl + sCityToSearch + sMetric,
			         dataType: "jsonp",
			         success: function(resultJSON) {
				            if ( typeOfSearch === _sSearchByCityName && resultJSON.list.length > 0 && callback !== null && callback !== undefined) {
				              callback(resultJSON);
				            }
				            else if( typeOfSearch === _sSearchById && callback !== null && callback !== undefined) {
				               callback(resultJSON);
				            }
				            else {
				            	alert('Ooooops!!! Something was wrong fetching cities information');
				            }
			         }
			    });
			}
	    }


	    function _removeCityFromCache(nCityId){
	    	var nIndex = _aFavCities.indexOf(nCityId);

	    	if (nIndex > -1){
	    		_aFavCities.splice(nIndex, 1);
	    	}

	    	_saveToCache();
	    }


	    function _removeFavorite(oCity, container){
	    	$('*[data-city-id="'+ oCity.id +'"] i', container).parent().remove();
	    	_removeCityFromCache(oCity.id);
	    }


	    function _removeFromFavListener(oCity, container){
	    	if (typeof oCity !== "undefined") {
		    	$('*[data-city-id="'+ oCity.id +'"] i', container).on('click', function(){
		    			var icon = $(this);
		    			var divParent = icon.parent();
		    			var cityId = icon.parent().data('city-id');

		    			divParent.remove();

		    			//change icon from cities found list
		    			$('*[data-city-id="'+ oCity.id +'"] i', _oCitiesFoundSection).removeClass('fa-star').addClass('fa-star-o');

		    			//remove from cache
		    			_removeCityFromCache(oCity.id);

		    		});
	   		 }	    	
	    }


	    function _saveToCache(){
	    	localStorage[_sCacheKey] = JSON.stringify(_aFavCities);	    	
	    }


	    function _iniTest(){

	    	_getFavCities();
	    	_oSearchCityBtn.on('click', function(){
	    		var sInputCity = _oInputCityByUser.val();

	    		if (sInputCity !== null && sInputCity !== undefined && sInputCity !== '' && sInputCity.length > (_nMinCitySearchChars-1)){
	    			_getCityWeatherInfo(sInputCity);
	    		}
	    		else {
	    			alert('Ooooops!!! At least enter ' + _nMinCitySearchChars +' characters, please');
	    		}
	    	});
	    }

	    /// PUBLIC VARS AND METHODS ///

	    return {
	    	iniTest: _iniTest
	    }
	})(window);


	//Begin of the test, only the first step mut be visible
	qustodioTest.iniTest();

}());