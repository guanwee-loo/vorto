
repositoryControllers.controller("tenantUserManagementController", 
    [ "$rootScope", "$scope", "$http", "$uibModal", "$uibModalInstance", "tenant", "dialogConfirm", 
    function($rootScope, $scope, $http, $uibModal, $uibModalInstance, tenant, dialogConfirm) {
        
    	$scope.tenant = tenant;
        $scope.isRetrievingTenantUsers = false;
        $scope.userTenantUsers = [];
        
        $scope.cancel = function() {
            $uibModalInstance.dismiss("Canceled.");  
        };
        
        $scope.$on("USER_CONTEXT_UPDATED", function(evt, data) {
            $scope.getTenants();
        });
        
        $scope.getTenantUsers = function(tenantId) {
            $scope.isRetrievingTenantUsers = true;
            
            $http.get("./rest/tenants/" + tenantId + "/users")
                .then(function(result) {
                    $scope.isRetrievingTenantUsers = false;
                    console.log(JSON.stringify(result));
                    $scope.userTenantUsers = result.data;
                }, function(reason) {
                    $scope.isRetrievingTenantUsers = false;
                    // TODO : handling of failures
                });
        };
        
        $scope.getTenantUsers($scope.tenant.tenantId);
        
        $scope.newUser = function() {
            return {
                edit: false,
                username : "",
                roleModelCreator : true,
                roleModelPromoter : true,
                roleModelReviewer : true,
                roleUser : true,
                roleAdmin : true
            };
        };
        
        $scope.editableUser = function(user) {
            return {
                edit: true,
                username : user.username,
                roleModelCreator : user.roles.includes("ROLE_MODEL_CREATOR"),
                roleModelPromoter : user.roles.includes("ROLE_MODEL_PROMOTER"),
                roleModelReviewer : user.roles.includes("ROLE_MODEL_REVIEWER"),
                roleUser : user.roles.includes("ROLE_USER"),
                roleAdmin : user.roles.includes("ROLE_TENANT_ADMIN")
            };
        };
        
        $scope.createOrUpdateUser = function(user) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: "webjars/repository-web/dist/partials/admin/createOrUpdateUser.html",
                size: "md",
                controller: "createOrUpdateUserController",
                resolve: {
                    user: function () {
                        return user;
                    },
                    tenantId: function() {
                        return $scope.tenant.tenantId;
                    }
                }
            });
            
            modalInstance.result.finally(function(result) {
                $scope.getTenantUsers($scope.tenant.tenantId);
                $rootScope.init();
            });
        };
        
        $scope.deleteUser = function(user) {
        	var dialog = dialogConfirm($scope, "Are you sure you want to remove user '" + user.username + "'?", ["Confirm", "Cancel"]);
        	
        	dialog.setCallback("Confirm", function() {
	            $http.delete("./rest/tenants/" + $scope.tenant.tenantId + "/users/" + user.username)
	                .then(function(result) {
	                    console.log("SUCCESS:" + JSON.stringify(result));
	                    $scope.getTenantUsers($scope.tenant.tenantId);
	                }, function(reason) {
	                    console.log("ERROR:" + JSON.stringify(reason));
	                    // TODO : Show error on window
	                });
        	});
        	
        	dialog.run();
        };
        
        $scope.hasUserRole = function(role, roles) {
            return roles.includes(role);
        }
    }
]);

repositoryControllers.controller("createOrUpdateUserController", 
    ["$rootScope", "$scope", "$uibModalInstance", "$http", "user", "tenantId",
    function($rootScope, $scope, $uibModalInstance, $http, user, tenantId) {
        
        $scope.mode = user.edit ? "Update" : "Create";
        $scope.user = user;
        $scope.tenantId = tenantId;
        $scope.isCurrentlyAddingOrUpdating = false;
        $scope.errorMessage = "";
        
        $scope.cancel = function() {
            $uibModalInstance.dismiss("Canceled.");  
        };
        
        $scope.addOrUpdateUser = function() {
            $scope.validate($scope.user, function(result) {
                if (result.valid) {
                    $scope.isCurrentlyAddingOrUpdating = false;
                    console.log(JSON.stringify($scope.getRoles($scope.user)));
                    $http.put("./rest/tenants/" + $scope.tenantId + "/users/" + $scope.user.username, {
                            "username": $scope.user.username,
                            "roles" : $scope.getRoles($scope.user)
                        })
                        .then(function(result) {
                            console.log("SUCCESS:" + JSON.stringify(result));
                            $uibModalInstance.close($scope.user); 
                        }, function(reason) {
                            console.log("ERROR:" + JSON.stringify(result));
                            // TODO : do proper error handling
                        });
                } else {
                    $scope.errorMessage = result.errorMessage;
                }
            });
        };
        
        $scope.getRoles = function(user) {
            var roles = [];
            if ($scope.user.roleModelCreator) {
                roles.push("ROLE_MODEL_CREATOR")
            }
            
            if ($scope.user.roleModelPromoter) {
                roles.push("ROLE_MODEL_PROMOTER")
            }
            
            if ($scope.user.roleModelReviewer) {
                roles.push("ROLE_MODEL_REVIEWER")
            }
            
            if ($scope.user.roleUser) {
                roles.push("ROLE_USER")
            }
            if ($scope.user.roleAdmin) {
                roles.push("ROLE_TENANT_ADMIN")
            }
            return roles;
        };
        
        $scope.validate = function(user, callback) {
            if (user.username === '') {
                callback({
                        valid : false,
                        errorMessage : "UserId must not be null."
                    });
            }
            
            $http.get("./rest/accounts/" + user.username)
                .then(function(result) {
                    callback({ valid: true });
                }, function(reason) {
                    console.log("ERROR:" + JSON.stringify(reason));
                    if (reason.status == 404) {
                        callback({
                            valid: false,
                            errorMessage: "User doesn't exist."
                        });
                    } else {
                        callback({
                            valid: false,
                            errorMessage: "Error while accessing the server."
                        });
                    }
                });
        };
    }
]);

