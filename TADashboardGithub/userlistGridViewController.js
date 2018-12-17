(function() {

	var userListGridViewController = function($scope, $compile, $resource,$q,$filter, $http, $sessionStorage,$log,
			$location,$translate,$window, zettaAppConfig, DTOptionsBuilder, $timeout, $interval, uiGridConstants, uiGridGroupingConstants, DTColumnBuilder,authService,userManagementService) {
		var vm = $scope;
		//vm.scope = $scope;
		vm.changeLocation = changeLocation;
		vm.assignLOBsToUsers = assignLOBsToUsers;
		$scope.errorMessage="";
		/*Translations for the view*/		
		var USERS_TXT = 'userAccount_Module.USERS_TXT';
		var USER_LIST_TXT = 'userAccount_Module.USER_LIST_TXT';
		var ERROR_NO_USER = 'common_Data.ERROR_MESSAGES.ERROR_NO_USER';
		var ASSIGN_LOB = 'userAccount_Module.ASSIGN_LOB';
		var EXPORT_USER_BTN ='common_Data.EXPORT_USER_BTN';
		var UPLOAD_USERS ='userAccount_Module.UPLOAD_USERS';
		var ADD_USER ='userAccount_Module.ADD_USER';
		var NAME_LABEL ='common_Data.NAME_LABEL';
		var ROLES ='common_Data.ROLES';
		var EMAIL_LABEL ='common_Data.EMAIL_LABEL';
		var LOB_LABEL ='common_Data.LOB_LABEL';
		var STATUS_LABEL="common_Data.STATUS_LABEL";
		var HIERARCHY_LABEL="common_Data.HIERARCHY";
		var ACTIVE_TXT ='common_Data.ACTIVE_TXT';
		var INACTIVE_TXT ='common_Data.INACTIVE_TXT';
		var VIEW_HIERARCHY ='common_Data.VIEW_HIERARCHY';
		$scope.tooltipHierarchy ="";
		$scope.quickLinks = [{
			linkIconClass: "fa fa-area-chart",
			linkPath: "#/userListGridView",
			linkText: $translate.instant(USERS_TXT)	
		}];
		
		$translate('common_Data.VIEW_HIERARCHY')
		.then(function (translatedTooltipValue) {
			$scope.tooltipHierarchy = translatedTooltipValue;
		});
			
		$scope.helpLink ="#/userListGridViewHelpPage";
		
		$translate('userAccount_Module.USER_LIST_TXT')
			.then(function (translatedValue) {
				$scope.moduleName = translatedValue;
			});

		function changeLocation(path)
		{
			$window.location = zettaAppConfig.appPath+"secure/index.html#"+path;
		}
		function assignLOBsToUsers()
		{
			if($scope.userList.length <=0) 
			{
				$scope.errorMessage= ERROR_NO_USER ;
				return;
			}
			
			userManagementService.modifyLOBForUsers($scope.userList);
		}


        $scope.uploadUsers = function()
        {
               
               location.href = 'index.html#/uploadUsers';
        }
        
         $scope.addUser = function()
               {
                     
               $window.location = zettaAppConfig.appPath+"secure/index.html#/addNewUser";
               }
        
         $scope.redirectToReportingUpload = function() 
         {
             $location.path('/uploadReportingChange')
         }
		
	
		vm.selected = {};
		vm.statusColList = {};
		vm.dtInstance = {};
		vm.selectAll = false;
		vm.toggleAll = toggleAll;
		vm.toggleOne = toggleOne;
		vm.toggleIsUserActive = toggleIsUserActive;
		//vm.rowClickHandler = rowClickHandler;
		var titleHtml = '<input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)">';

		vm.exportToExcel=function(){	
		    
			 alasql('SELECT * INTO XLSX("pageTitle.xls",{headers:true}) \
				FROM HTML("#userList",{headers:true})');		
		
		    }
		 
		$scope.gridOptions = {
				 rowHeight: 0, 
			    enableRowSelection: true,
			    enableSelectAll: true,
			    enableFiltering: true, 
			    enableColumnResizing:true,
			    showGridFooter:true,
			    enableFiltering:true,
			    enableColumnResizing:true,
			    showGridFooter :true,
			    showColumnFooter:true,
			    enableGridMenu:true,
			    exporterMenuPdf: false,
		  		fastWatch:true,
		  		'exporterCsvFilename' : 'clarification-status.csv',
	            exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
	            onRegisterApi: function(gridApi){$scope.gridApi = gridApi;}
		  	  };

    
		$scope.exportCsv = function() {
            var grid = $scope.gridApi.grid;
            var rowTypes = uiGridExporterConstants.ALL;
            var colTypes = uiGridExporterConstants.ALL;
            uiGridExporterService.csvExport(grid, rowTypes, colTypes);
        };
	
       
        
    	$scope.hierarchyView = function(empId){		
			$location.path('/hierarchy/'+empId);
		}
		
		  $scope.gridOptions.columnDefs = [
		    { field:'userProfile.userName', sort: { direction: 'asc', priority: 0 }, displayName: $translate.instant('common_Data.NAME_LABEL'), width:'17%',cellTemplate:'<div>' +
		        '<a style="padding-left: 10px;" href="#/userprofiles/'+authService.authentication.accountId+'/userEmpID/{{row.entity.userProfile.userEmpId}}">{{COL_FIELD}}</a>' +
	             '</div>' },
		    { field:'userProfile.userEmailId',displayName: $translate.instant('common_Data.EMAIL_LABEL'),  width:'20%' },
		    { field:'userProfileLobList.toString()',displayName: $translate.instant('common_Data.LOB_LABEL'), width:'10%',cellTemplate:'<div class="ui-grid-cell-contents grid-tooltip" tooltip="{{ row.entity.userProfileLobList.toString() }}" tooltip-placement="right" ng-bind="row.entity.userProfileLobList" ></div>' },
		    { name:'employeeStatus',field:'employeeStatus',displayName: $translate.instant('common_Data.STATUS_LABEL'), width:'20%',
		    	cellTemplate:'<div class="ui-grid-cell-contents"> {{row.entity.employeeStatus}}</div>' },
		    { field:'userProfileRoleList.toString()',displayName: $translate.instant('common_Data.ROLES'), width:'20%',cellTemplate:'<div class="ui-grid-cell-contents wrapper grid-tooltip" tooltip="{{ row.entity.userProfileRoleList.toString() }}" tooltip-placement="top" ng-bind=" row.entity.userProfileRoleList"></div>' },
		    { field:'Hirarchy', width:'10%', displayName: $translate.instant('common_Data.HIRARCHY_LABEL'),cellTemplate:'<div class="ui-grid-cell-contents">'
		    		+'<a ng-show="row.entity.employeeStatus" ng-click="grid.appScope.hierarchyView(row.entity.userProfile.id)" class="pointer iconSize hierarchyCenter" data-toggle="tooltip" tooltip=""+tooltipHierarchy +"" tooltip-placement="top"><i class="fa fa-sitemap userHierarchyTree"></i></a>'
		    		+'<span ng-hide="row.entity.employeeStatus" class="hierarchyCenter"><i class="fa fa-sitemap iconSize userHierarchyTree"></i><i class="fa fa-ban  bandHierarchy"></i> </span>' 
		    		}
		    	  
		    ];
		  
		  
		  
		  
			$scope.showLoader = true;
	
			$scope.changeStatus = function(employeeStatus){
				var status;
				if(employeeStatus) {
					status = "Active";
				} else {
					status = "InActive";
				}
				
				return status;
			}

		    $scope.getTableHeight = function() {
		       var rowHeight = 30; // your row height
		       var headerHeight = 30; // your header height
		       return {
		          height: ($scope.gridOptions.data.length * rowHeight + headerHeight) + "px"
		       };
		    };
		  $scope.gridOptions.multiSelect = true;
		 		  

		  $scope.callsPending = 0;

		      $http.get(zettaAppConfig.serviceBase
						+ '/userprofiles/account/'+authService.authentication.accountId+'?outputType=chunked')
		        .success(function(data) {
		        	$scope.showLoader = false;
		        	 $scope.gridOptions.data = data;
		        	  $timeout(function() {
		        	        if(angular.isDefined($scope.gridApi.selection.selectRow)){
		        	          $scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);
		        	        }
		        	      });
		        }) .error(function(data) {
		        	$scope.showLoader = false;
		        	 $scope.gridOptions.data = data;
		        });
		        $scope.info = {};

		      $scope.toggleMultiSelect = function() {
		        $scope.gridApi.selection.setMultiSelect(!$scope.gridApi.grid.options.multiSelect);
		      };

		      $scope.toggleModifierKeysToMultiSelect = function() {
		        $scope.gridApi.selection.setModifierKeysToMultiSelect(!$scope.gridApi.grid.options.modifierKeysToMultiSelect);
		      };

		      $scope.selectAll = function() {
		        $scope.gridApi.selection.selectAllRows();
		      };

		      $scope.clearAll = function() {
		        $scope.gridApi.selection.clearSelectedRows();
		      };

		      $scope.toggleRow1 = function() {
		        $scope.gridApi.selection.toggleRowSelection($scope.gridOptions.data[0]);
		      };

		      $scope.toggleFullRowSelection = function() {
		        $scope.gridOptions.enableFullRowSelection = !$scope.gridOptions.enableFullRowSelection;
		        $scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.OPTIONS);
		      };

		      $scope.setSelectable = function() {
		        $scope.gridApi.selection.clearSelectedRows();

		        $scope.gridOptions.isRowSelectable = function(row){
		            return true;
		        };
		        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);

		        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
		      };

		      $scope.userList = [];
		      $scope.gridOptions.onRegisterApi = function(gridApi){
		        //set gridApi on scope
		        $scope.gridApi = gridApi;
		        gridApi.selection.on.rowSelectionChanged($scope,function(row){
		          var msg = 'row selected ' + row.isSelected;
		          
		          if(row.isSelected) {
		        	  $scope.userList.push(row.entity.userProfile.id);
		          } else  {
		        	  var index = $scope.userList.indexOf(row.entity.userProfile.id);
		        	  $scope.userList.splice(index,1);
		          }
		          
		          $log.log(msg);
		        });

		        gridApi.selection.on.rowSelectionChangedBatch($scope,function(rows){
		          var msg = 'rows changed ' + rows.length;
		          $log.log(msg);
		        });
		      };
		    
		      $scope.filterText;
		      $scope.data = $scope.gridOptions.data;
		      $scope.filterGrid = {};
		      $scope.refreshData = function() {
			        $scope.gridOptions.data = $filter('filter')( $scope.gridOptions.data, $scope.filterText, undefined);
			        if($scope.filterText=="") {
			        	$scope.gridOptions.data =$scope.data;
					            	
			        }
		      }		

		function toggleIsUserActive(empId,statusColList)
		{
			var me = this;
			var employeeId =null;
			var employeeStatus = null;
				if (statusColList.hasOwnProperty(empId)) {
					employeeId =empId;
					employeeStatus = !statusColList[empId].status;
				}
			
			
			$http(
					{
						
						method : 'PUT',
						url : zettaAppConfig.serviceBase
								+ '/userprofiles/employeestatus/'+employeeId+'/Accounts/'+authService.authentication.accountId+'/status/'+employeeStatus
					}).success(function(data) {
						
				
						//reload datatable to fetch fresh data
						var resetPaging = false;
						vm.dtInstance.reloadData(null, resetPaging);
				
			}).error(function(data) {
			
				alert('Something goes worng with request for status change')
				
			});
			
		}
		
		function toggleAll(selectAll, selectedItems) {
			for ( var id in selectedItems) {
				if (selectedItems.hasOwnProperty(id)) {
					selectedItems[id] = !selectAll;
				}
			}
		}
		function toggleOne(selectedItems) {
			var me = this;
			for ( var id in selectedItems) {
				if (selectedItems.hasOwnProperty(id)) {
					if (!selectedItems[id]) {
						me.selectAll = false;
						return;
					}
				}
			}
			me.selectAll = true;
		}

		
		$scope.successMessage = userManagementService.successfulMessage;
		$scope.$on('$locationChangeStart',function(event){
			userManagementService.successfulMessage = null;
			$scope.successMessage = null;
			
		});
	}
	// register the controller
	var app = angular.module("zettaApp");
	app.directive('quickLinksUser',function(){
		return {
			templateUrl:'../secure/views/moduleLanding.html'
		}
	});
	
	app.controller("userListGridViewController", [ '$scope', '$compile', '$resource','$q','$filter',
			'$http', '$sessionStorage','$log', '$location','$translate','$window', 'zettaAppConfig', 'DTOptionsBuilder','$timeout', '$interval', 'uiGridConstants', 'uiGridGroupingConstants',
			'DTColumnBuilder','authService','userManagementService', userListGridViewController ]);
}());
