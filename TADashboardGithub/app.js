var app = angular.module('app', ['ngAnimate','ui.grid.edit', 'ngTouch', 'ui.grid', 'ui.bootstrap.modal']);

app.controller('MainCtrl', ['$scope', '$http', 'uiGridConstants', function ($scope, $http, uiGridConstants) {
    
  $scope.gridOptions = {  
    enableFiltering: false,
    flatEntityAccess: true,
    showGridFooter: true,
    fastWatch: true
    
  };

    var accounts = ['URD','LMT']
    $scope.selectedAccount = 'URD';
    
    $( "#datepicker" ).datepicker();
 
    $('.hasDatepicker').datepicker({
       onSelect: function(selected,evnt) {
            updateAb(selected);
            $(this).change();
        }
   }).on("change", function() {
        updateAb();
    });

    function updateAb(value){     
        console.log($('#datepicker').val()); 
        changeValue( $('#datepicker').val());
    
    }
    
  $scope.arr = [];
   $scope.gridOptions.columnDefs = [
    {name:'userId',enableCellEdit: false},
    {field:'firstLoginTime',enableCellEdit: false},
    {field:'lastEntryTime',enableCellEdit: false},
    {field:'queueDetails',enableCellEdit: false, cellTemplate:'<div class="ui-grid-cell-contents">'
		    		+'<a  ng-click="grid.appScope.hierarchyView(row.entity.userId, row.entity.queueDetails)" ng-bind=" row.entity.queueLength"></a>' },
    {field:'totalProductiveTime',enableCellEdit: false},
    {field:'totalCasesProcessed',enableCellEdit:true},
    {field:'aHT(sec)',enableCellEdit:true},
    {field:'casesPerHour',enableCellEdit:true}

  ];

     	$scope.hierarchyView = function(ldap, queueDetails){		
			 var ul = document.createElement("div");
            document.getElementById("showDetails").innerHTML="";
            ul.setAttribute("class","grid-container-three");
            document.getElementById("myModalLabel").innerText=ldap+" Queue Details";
            var li1 = document.createElement("div");
            var li2 = document.createElement("div");
            var li3 = document.createElement("div");
            li1.setAttribute("class","grid-item");
            li2.setAttribute("class","grid-item");
            li3.setAttribute("class","grid-item");
            li1.setAttribute("style","background-color:#c397b8;color:white;");
            li2.setAttribute("style","background-color:#c397b8;color:white;");
            li3.setAttribute("style","background-color:#c397b8;color:white;");
            li1.appendChild(document.createTextNode( 'Queue Name' )); 
            li2.appendChild(document.createTextNode( "Case Processed in the Queue" )); 
            li3.appendChild(document.createTextNode( "Activity Start Time" )); 
            ul.appendChild(li1);
            ul.appendChild(li2);
            ul.appendChild(li3); 
            
         Object.entries(queueDetails).forEach(function(data,count){
                li1 = document.createElement("div");
                li2 = document.createElement("div");
                li3 = document.createElement("div");
                li1.setAttribute("class","grid-item");
                li2.setAttribute("class","grid-item");
                li3.setAttribute("class","grid-item");
                li1.appendChild(document.createTextNode(data[0]));
                li2.appendChild(document.createTextNode(data[1]));
                li3.appendChild(document.createTextNode('NA'));
                ul.appendChild(li1);
                ul.appendChild(li2);
                ul.appendChild(li3);
           });
            document.getElementById("showDetails").appendChild(ul); 
            $('#myModal').modal('show');
		}   
    window.addEventListener("load", function(event) {
        if (event.source != window)
            return;

        if (event.data.type && (event.data.type == "FROM_PAGE")) {
            console.log("Content script received message: " + event.data.text);
        }
    });
    

 $scope.msg = {};

 var url ='';
var timeDiffInSec = function(d1,d2) {
    var date1 = new Date(d1);
    var date2 = new Date(d2);    
    var diff = (date2.getTime() - date1.getTime())/1000;
    return diff;
}
function convertTime(counter){
    if(counter < 60 ){
        return (counter)+" Sec" ;
    } else if(counter < 3600 && counter >= 60 ){
        return Math.floor(counter/60)+" Min "+(counter%60).toFixed(0)+" Sec";
    } else if(counter >= 3600 ){
        return Math.floor(counter/3600)+" Hour "+Math.floor((counter/3600 - Math.floor(counter/3600))*60)+" Min "+Math.floor(((counter/3600 - Math.floor(counter/3600))*60 - Math.floor((counter/3600 - Math.floor(counter/3600))*60))*60)+" Sec";
    }    
}
//setInterval(function(){
//    
//  if( $('#datepicker').val()== "" || $('#datepicker').val() == new Date().toLocaleDateString('en')) {
//    changeValue( new Date().toLocaleDateString('en'));      
//  }
//},30000);
    
$scope.selectAccount = function(val){
    
    var selectedDate = ($('#datepicker').val())?$('#datepicker').val(): new Date().toLocaleDateString('en');
    changeValue(selectedDate, val.selectedAccount);
    
}
    
    function changeValue(todateEnDate, LOB){
       var accountIndex =  accounts.indexOf($scope.selectedAccount)+1;
        if($scope.gridOptions.data)   $scope.gridOptions.data.length=0;
         url = (LOB == 'WPMS')? 'https://spreadsheets.google.com/feeds/list/1XIj6wPCccPhrEonlRpODWpWJusrePYyX1awAxPscWF4/'+accountIndex+'/public/values?alt=json':'https://spreadsheets.google.com/feeds/list/1IWTnHZbVvqslTnpb_B2OTjhEvRUG2E2wVIi8iYxg388/1/public/values?alt=json';
     $http.get(url)
  .success(function(data) {
        data = data.feed.entry;
         
       var todaysData = data.filter(function(d){return d.gsx$clickedtime.$t.includes(todateEnDate) });
       var todaysData = data.filter(function(d){
           return new Date(d.gsx$clickedtime.$t).toLocaleDateString('en') == new Date(todateEnDate).toLocaleDateString('en')
        });
      
     
        var showData = todaysData.map(function(ta){return ta.gsx$classifier.$t}).filter(function(s,i,f){return f.indexOf(s)==i}).map(
            function(ldap,count){
                var obj ={};
                obj[ldap] = todaysData.filter(function(td){return td.gsx$classifier.$t==ldap}).map(
                    function(tld,i,full){
                    if(i==0){
                        return timeDiffInSec(tld.gsx$clickedtime.$t,tld.gsx$exittime.$t) 
                    } else if(full[i-1].gsx$clickedtime.$t ==tld.gsx$clickedtime.$t) {
                        return timeDiffInSec(full[i-1].gsx$exittime.$t,tld.gsx$exittime.$t) 
                    } else {
                        return timeDiffInSec(tld.gsx$clickedtime.$t,tld.gsx$exittime.$t)
                     }
                    }).filter(function(dt){
                        return Number(dt)}).reduce(function(a,b){return a+b
                    },0);
                
                var queueData = todaysData.filter(function(td){return td.gsx$classifier.$t==ldap}).map(
                  function(tdl){
                      return tdl.gsx$queueclicked.$t
                  });

                var queDetails = queueData.filter(function(qd){return qd!==""}).reduce(
                  function(r,o){ 
                      if(r[o]){
                          r[o]=r[o]+1
                      } else {
                          r[o]= 1
                      }  return r;
                  },{});

                obj['queueDetails'] = queDetails;
                obj['entryTime'] = todaysData.filter(function(td){return td.gsx$classifier.$t==ldap})[0].gsx$clickedtime.$t;
                obj['lastEntryTime'] = todaysData.filter(function(td){return td.gsx$classifier.$t==ldap}).slice(-1)[0].gsx$exittime.$t;
                obj['lastEntryTime'] = (obj['lastEntryTime']=='' )?todaysData.filter(function(td){return td.gsx$classifier.$t==ldap}).slice(-1)[0].gsx$clickedtime.$t:obj['lastEntryTime'];  
                obj['caseNo'] =todaysData.filter(function(td){return td.gsx$classifier.$t==ldap}).length;
                return obj;
          });
        var test = {};
     $scope.arr.length =0;
    for(var i = 0; i < showData.length; i++){
        test.userId = Object.keys(showData[i])[0];
        test.firstLoginTime = showData[i].entryTime;
        test.queueDetails =  showData[i].queueDetails;
        test.queueLength = Object.keys(showData[i].queueDetails).length;
        test.lastEntryTime = showData[i].lastEntryTime;
        test.totalProductiveTime = convertTime(showData[i][ test.userId]);
        test.totalCasesProcessed  = showData[i].caseNo;
        test['aHT(sec)'] = Math.floor(showData[i][ test.userId]/showData[i].caseNo);
        test['casesPerHour'] = Math.floor((showData[i].caseNo/ showData[i][ test.userId])*3600 );
        $scope.arr.push(test);
        test ={};
    }
    
    
    $scope.gridOptions.data = $scope.arr;
  });
  
}
     changeValue( new Date().toLocaleDateString('en'));
  
}]);

angular.module('ui.bootstrap.modal', [])
.constant('modalConfig', {
  backdrop: true,
  escape: true
})
.directive('modal', ['$parse', 'modalConfig', function($parse, modalConfig) {
  var backdropEl;
  var body = angular.element(document.getElementsByTagName('body')[0]);
  return {
    restrict: 'EA',
    link: function(scope, elm, attrs) {
      var opts = angular.extend({}, modalConfig, scope.$eval(attrs.uiOptions || attrs.bsOptions || attrs.options));
      var shownExpr = attrs.modal || attrs.show;
      var setClosed;

      if (attrs.close) {
        setClosed = function() {
          scope.$apply(attrs.close);
        };
      } else {
        setClosed = function() {
          scope.$apply(function() {
            $parse(shownExpr).assign(scope, false);
          });
        };
      }
      elm.addClass('modal');

      if (opts.backdrop && !backdropEl) {
        backdropEl = angular.element('<div class="modal-backdrop"></div>');
        backdropEl.css('display','none');
        body.append(backdropEl);
      }

      function setShown(shown) {
        scope.$apply(function() {
          model.assign(scope, shown);
        });
      }

      function escapeClose(evt) {
        if (evt.which === 27) { setClosed(); }
      }
      function clickClose() {
        setClosed();
      }

      function close() {
        if (opts.escape) { body.unbind('keyup', escapeClose); }
        if (opts.backdrop) {
          backdropEl.css('display', 'none').removeClass('in');
          backdropEl.unbind('click', clickClose);
        }
        elm.css('display', 'none').removeClass('in');
        body.removeClass('modal-open');
      }
      function open() {
        if (opts.escape) { body.bind('keyup', escapeClose); }
        if (opts.backdrop) {
          backdropEl.css('display', 'block').addClass('in');
          if(opts.backdrop != "static") {
            backdropEl.bind('click', clickClose);
          }
        }
        elm.css('display', 'block').addClass('in');
        body.addClass('modal-open');
      }

      scope.$watch(shownExpr, function(isShown, oldShown) {
        if (isShown) {
          open();
        } else {
          close();
        }
      });
    }
  };
}]);
