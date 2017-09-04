var todoList = angular.module("todoApp",['ngRoute','firebase','ui.bootstrap'])

todoList.config(function($routeProvider) {
    $routeProvider
        .when("/",{templateUrl:"views/login.html"})
        .when("/home",{templateUrl:"views/home.html"})
        .when("/list/:listname",{templateUrl:"views/list.html"})
        .otherwise({redirectTo:"/"})
});

todoList.controller("loginCtrl", function($firebaseAuth, $location) {
    var auth =  $firebaseAuth();

    // autologin
    auth.$onAuthStateChanged(function(user) {
            if (user) {
                $location.path("/home");
            } else {
            $location.path("/"); 
            }
        });

    this.loginWithGoogle = function() {
        var promise = auth.$signInWithPopup("google");


        promise.then(function(result) {
        console.log("Signed in as:", result);
        this.user = result.user;
        $location.path("/home");
        })
        .catch(function(error) {
        console.error("Authentication failed:", error);
        });
    };

    this.loginWithFacebook = function() {
        var promise = auth.$signInWithPopup("facebook");


        promise.then(function(result) {
        console.log("Signed in as:", result);
        this.user = result.user;
        $location.path("/home");
        })
        .catch(function(error) {
        console.error("Authentication failed:", error);
        });
    };

   
});

todoList.controller("homeCtrl", function($firebaseArray, $firebaseAuth, $location) {
    var auth =  $firebaseAuth();
    this.user = auth.$getAuth();
    var listRef = firebase.database().ref(this.user.uid+"/lists");
    var list = $firebaseArray(listRef);
    this.lists = list;
    
    
    this.addList = function() {
        this.lists.$add({"name":this.list});
        this.list = "";
    }

    this.removeList = function(i) {
        if(confirm("Are you sure you want to delete "+this.lists[i].name+" list?")) {
           console.log(i);
            this.lists.$remove(i);
            console.log(this.lists); 
        }
    };

    this.signOut = function() {
        firebase.auth().signOut().then(function() {
        // Sign-out successful.
        $location.path("/");
        }).catch(function(error) {
        // An error happened.
        });
    };

});

todoList.controller("todoCtrl", function($firebaseArray, $firebaseAuth ,$routeParams) {
    var auth =  $firebaseAuth();
    this.user = auth.$getAuth();
    this.tasks = [];
    this.name=$routeParams.listname;
    var taskRef = firebase.database().ref(this.user.uid+'/tasks').child(this.name);
    this.tasks = $firebaseArray(taskRef);
    this.editMode = false;
    this.savedIndex = 0;
    this.currentID = 0;
    this.count = 0;

    // this.tasks.$loaded().then(function() {
    //     // for (var i=0;i<this.tasks.length;i++) {
    //     //     if (this.tasks[i].status)
    //     //         this.count = this.count + 1;
    //     // }
    //     console.log("working")
    // });

    this.addTask = function() {
        var obj = {};
        obj.title = this.task;
        obj.status = false;
        this.currentID += 1;
        obj.id = this.currentID;
        this.tasks.$add(obj);
        this.task = "";
        console.log(this.tasks);
    }

    

    this.deleteTask = function(id) {
            for(var i=0;i<this.tasks.length;i++) {
                if(this.tasks[i].id == id)
                    break;
            }
            if(confirm("Are you sure you want to delete "+this.tasks[i].title+" task?")) {
                this.tasks.$remove(i);
            }
            console.log(this.tasks);
        }

    this.editTask = function(id) {
        for(var i=0;i<this.tasks.length;i++) {
            if(this.tasks[i].id == id)
                break;
        }
        console.log(this.tasks.length, i);
        this.editMode = true;
        this.savedIndex = i;
        this.task = this.tasks[i].title;

    }

    this.updateTask = function() {
        this.editMode = false;
        this.tasks[this.savedIndex].title = this.task;
        this.tasks.$save(this.savedIndex);
        this.task = "";
    }

    this.setStatus = function(id) {
        for(var i=0;i<this.tasks.length;i++) {
            if(this.tasks[i].id == id)
                break;
        }
        this.tasks[i].status = !this.tasks[i].status;
        if(this.tasks[i].status)
            this.count += 1;
        if(!this.tasks[i].status)
            this.count -= 1;
        this.tasks.$save(i);
        this.tasks.$save(this.count);
        console.log(this.tasks);
    }  

    this.moveUp = function(id) {
            for(var i=0; i<this.tasks.length; i++) {
                if(i!=0 && this.tasks[i].id == id) {
                    
                    var temp = this.tasks[i-1].title;
                    this.tasks[i-1].title = this.tasks[i].title;
                    this.tasks[i].title = temp;
                    
                    var temp = this.tasks[i-1].id;
                    this.tasks[i-1].id = this.tasks[i].id;
                    this.tasks[i].id = temp;

                    var temp = this.tasks[i-1].status;
                    this.tasks[i-1].status = this.tasks[i].status;
                    this.tasks[i].status = temp;

                    this.tasks.$save(i-1);
                    this.tasks.$save(i);
                }

            }
        }

        this.moveDown = function(id) {
            for(var i=0; i<this.tasks.length; i++) {
                if(i!=this.tasks.length-1 && this.tasks[i].id == id) {
                    
                    var temp = this.tasks[i+1].title;
                    this.tasks[i+1].title = this.tasks[i].title;
                    this.tasks[i].title = temp;
                    
                    var temp = this.tasks[i+1].id;
                    this.tasks[i+1].id = this.tasks[i].id;
                    this.tasks[i].id = temp;

                    var temp = this.tasks[i+1].status;
                    this.tasks[i+1].status = this.tasks[i].status;
                    this.tasks[i].status = temp;

                    this.tasks.$save(i);
                    this.tasks.$save(i+1);
                }

            }
        }
        
        this.signOut = function() {
        firebase.auth().signOut().then(function() {
        // Sign-out successful.
        $location.path("/");
        }).catch(function(error) {
        // An error happened.
        });
    };


});
