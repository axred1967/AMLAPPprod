var app = {
  initialize: function() {
    this.bind();
  },
  bind: function() {
    document.addEventListener('deviceready', getChkLogin, false);
  },
  deviceready: function() {
    // This is an event handler function, which means the scope is the event.
    // So, we must explicitly called `app.report()` instead of `this.report()`.
    app.report('deviceready');
  },
  report: function(id) {
    // Report the event in the console
    console.log("Report: " + id);
  },
};

function getChkLogin()
{

  chkloggedin();

}

setTimeout(function(){
  checkthesidebarinfouser();
}, 800);

var app2 = angular.module('myApp', ['pascalprecht.translate','ng-currency','fieldMatch']);
//Field Match directive
angular.module('fieldMatch', [])
.directive('fieldMatch', ["$parse", function($parse) {
  return {
    require: 'ngModel',
    link: function(scope, elem, attrs, ctrl) {
      var me = $parse(attrs.ngModel);
      var matchTo = $parse(attrs.fieldMatch);
      scope.$watchGroup([me, matchTo], function(newValues, oldValues) {
        ctrl.$setValidity('fieldmatch', me(scope) === matchTo(scope));
      }, true);
    }
  }
}]);
//Run material design lite
app2.directive("ngModel",["$timeout", function($timeout){
  return {
    restrict: 'A',
    priority: -1, // lower priority than built-in ng-model so it runs first
    link: function(scope, element, attr) {
      scope.$watch(attr.ngModel,function(value){
        $timeout(function () {
          if (value){
            element.trigger("change");
          } else if(element.attr('placeholder') === undefined) {
            if(!element.is(":focus"))
            element.trigger("blur");
          }
        });
      });
    }
  };
}]);

app2.run(function($rootScope, $timeout) {
  $rootScope.$on('$viewContentLoaded', function(event) {
    $timeout(function() {
      componentHandler.upgradeAllRegistered();
    }, 0);
  });
  $rootScope.render = {
    header: true,
    aside: true
  }
});

app2.filter('capitalize', function() {
  return function(input, $scope) {
    if ( input !==undefined && input.length>0)
    return input.substring(0,1).toUpperCase()+input.substring(1);
    else
    return input

  }
});

app2.controller('personCtrl', function ($scope,$http,$translate) {
  $scope.page={}

  curr_page=base_name()
  page=localStorage.getItem(curr_page)
  if ( page!= null && page.length >0 ){
    $scope.page=JSON.parse(page)
    $scope.action=$scope.page.action

  }
  if ($scope.page.editDoc) {
    $scope.Kyc=JSON.parse(localStorage.getItem('Kyc'))
    Doc=JSON.parse(localStorage.getItem('Doc'))
    convertDateStringsToDates(Doc)
    $scope.Kyc.contractor_data.Docs[Doc.indice]=Doc
    $('#loader_img').hide();
  }
  else if ($scope.page.addDoc){
    $scope.Kyc=JSON.parse(localStorage.getItem('Kyc'))
    Doc=JSON.parse(localStorage.getItem('Doc'))
    convertDateStringsToDates(Doc)
    if ($scope.Kyc.contractor_data.Docs.length!==undefined|| $scope.Kyc.contractor_data.Docs.length>0 ){
      $scope.Kyc.contractor_data.Docs[$scope.Kyc.contractor_data.Docs.length]=Doc
    }
    else {
      $scope.Kyc.contractor_data.Docs=[]
      $scope.Kyc.contractor_data.Docs[0]=Doc
    }
    $('#loader_img').hide();

  }
  else {
    switch ($scope.action){
      default:
      var id=localStorage.getItem("CustomerProfileId");
      var email=localStorage.getItem("userEmail");
      $scope.Contract=JSON.parse(localStorage.getItem('Contract'))
      appData=$scope.Contract
      data= {"action":"kycAx",appData:appData,country:true}
      $http.post( SERVICEURL2,  data )
      .success(function(responceData) {
        $('#loader_img').hide();
        if(responceData.RESPONSECODE=='1') 			{
          data=responceData.RESPONSE;
          $scope.Kyc=data;
          $scope.countryList=responceData.countrylist
          if ($scope.Kyc.date_of_identification===undefined || $scope.Kyc.date_of_identification)
          $scope.Kyc.date_of_identification=new Date()
          $scope.Kyc.contractor_data=IsJsonString($scope.Kyc.contractor_data)
          $scope.Kyc.contractor_data.Docs=IsJsonString($scope.Kyc.contractor_data.Docs)
          $scope.Kyc.owner_data=IsJsonString($scope.Kyc.owner_data)
          $scope.Kyc.company_data=IsJsonString($scope.Kyc.company_data)
          convertDateStringsToDates($scope.Kyc)
          convertDateStringsToDates($scope.Kyc.contractor_data)
          convertDateStringsToDates($scope.Kyc.Docs)
          convertDateStringsToDates($scope.Kyc.company_data)
          convertDateStringsToDates($scope.Kyc.owner_data)
          if ($scope.Kyc.contractor_data.Docs == false || $scope.Kyc.contractor_data.Docs===undefined ||  $scope.Contract.Docs.length===undefined ||  $scope.Contract.Docs.length==0){
            $scope.Kyc.contractor_data.Docs=[]
            $scope.Kyc.contractor_data.Docs[0]={}
            $scope.Contract.DocsLoaded=0;
            $scope.Kyc.contractor_data.Docs[0].doc_name="Immagine Doc identità"
            $scope.Kyc.contractor_data.Docs[0].doc_type="Documento itentià"
            $scope.Kyc.contractor_data.Docs.doc_date=new Date()

          }
          $('input.mdl-textfield__input').each(
            function(index){
              $(this).parent('div.mdl-textfield').addClass('is-dirty');
              $(this).parent('div.mdl-textfield').removeClass('is-invalid');
            }
          );
        }
        else
        {
          console.log('error');
        }
      })
      .error(function() {
        console.log("error");
      });
    }
    $scope.action="saveKyc"
    $scope.viewName="Informazioni personali"


  }
  $scope.save_kyc= function (passo){
    if ($scope.form.$invalid) {
      angular.forEach($scope.form.$error, function(field) {
        angular.forEach(field, function(errorField) {
          errorField.$setTouched();
        })
      });
      swal("riempire form corretamente");
      console.log("Form is invalid.");
      return
    } else {
      //$scope.formStatus = "Form is valid.";
      console.log("Form is valid.");
      console.log($scope.data);
    }
    var langfileloginchk = localStorage.getItem("language");
    dbData=$scope.Kyc
    dbData.contractor_data=JSON.stringify(dbData.contractor_data)
    dbData.Docs=JSON.stringify(dbData.Docs)
    dbData.company_data=JSON.stringify(dbData.company_data)
    dbData.owner_data=JSON.stringify(dbData.owner_data)


    $('#loader_img').show();
    data={ "action":"saveKycAx", appData:$scope.Contract,dbData:dbData}
    $http.post( SERVICEURL2,  data )
    .success(function(data) {
      $('#loader_img').hide();
      if(data.RESPONSECODE=='1') 			{
        swal("",data.RESPONSE);
        $scope.lastid=data.lastid

        $scope.back(passo)

      }
      else
      {
        console.log('error');
        swal("",data.RESPONSE);
      }
    })
    .error(function() {
      console.log("error");
    });


  }


  $scope.showAC=function($search,$word){
    var id=localStorage.getItem("userId");
    var usertype = localStorage.getItem('userType');
    res = $search.split(".")
    $search=res[1]
    if ($word===undefined){
      $word=$scope[res[0]][res[1]]
    }
    else {
      $word=$('#'+$word).val()
    }
    $table=res[0].toLowerCase()

    if (( $word  !== "undefined" && $word.length>3 &&  $word!=$scope.oldWord)){

      data={ "action":"ACWord", id:id,usertype:usertype,  word:res[1] ,search:$word ,table:$table}
      $http.post( SERVICEURL2,  data )
      .success(function(data) {
        if(data.RESPONSECODE=='1') 			{
          //$word=$($search.currentTarget).attr('id');
          $scope.word[$search]=data.RESPONSE;
        }
      })
      .error(function() {
        console.log("error");
      });
    }
    $scope.oldWord= $($search.currentTarget).val()
  }
  $scope.resetAC=function(){
    $scope.word={}
    $scope.list={}
    $scope.listOther={}
    $scope.listCompany={}


  }
  $scope.addWord=function($search,$word){
    res = $search.split(".")
    switch(res.length){
      case 2:
      $scope[res[0]][res[1]]=$word
      $scope.word[res[1]]=[]
      break;
      case 3:
      $scope[res[0]][res[1]][res[2]]=$word
      $scope.word[res[2]]=[]
      break;

    }
  }
  $scope.uploadfromgallery=function(Doc,index)
  {
    Doc.index=index
    localstorage('Doc', JSON.stringify(Doc));
    // alert('cxccx');
    navigator.camera.getPicture($scope.uploadPhoto,
      function(message) {
        alert('get picture failed');
      },
      {
        quality: 50,
        destinationType: navigator.camera.DestinationType.FILE_URI,
        sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
      }
    );
  }
  $scope.add_photo=function(Doc, index)
  {
    Doc.index=index
    localstorage('Doc', JSON.stringify(Doc));
    // alert('cxccx');
    navigator.camera.getPicture($scope.uploadPhoto,
      function(message) {
        alert('get picture failed');
      },
      {
        quality: 50,
        destinationType: navigator.camera.DestinationType.FILE_URI,
        sourceType: navigator.camera.PictureSourceType.CAMERA
      }
    );
  }

  $scope.uploadPhoto=function(imageURI){
    $("#loader_img").show()
    $scope.Doc=JSON.parse(localStorage.getItem('Doc'))

    var options = new FileUploadOptions();
    options.fileKey="file";
    options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1)+'.png';
    options.mimeType="text/plain";
    options.chunkedMode = false;
    var params = new Object();

    options.params = params;
    var ft = new FileTransfer();
    ft.upload(imageURI, encodeURI(BASEURL+"service.php?action=upload_document_image_multi&userid="+$scope.Doc.per_id+"&for="+$scope.Doc.per), $scope.winFT, $scope.failFT, options,true);



  }
  $scope.winFT=function (r)
  {
    Doc=JSON.parse(localStorage.getItem('Doc'))
    var review_info   =JSON.parse(r.response);
    var id = review_info.id;
    $('#doc_image').val(review_info.response);
    // var review_selected_image  =  review_info.review_id;
    //$('#review_id_checkin').val(review_selected_image);
    data={ "action":"get_document_image_name_multi", id:id,DocId: $scope.Doc.id}
    $http.post( SERVICEURL2,  data )
    .success(function(data) {
      if(data.RESPONSECODE=='1') 			{
        //$word=$($search.currentTarget).attr('id');
        $scope.Cotnract.Docs[Doc.index].doc_image=data.RESPONSE;
        $("#loader_img").hide()
      }
    })
    .error(function() {
      $("#loader_img").hide()
      console.log("error");
    });
  }
  $scope.failFT =function (error)
  {
    $("#loader_img").hide()

  }


  $scope.add_document=function(Doc){
    if (Doc===undefined){
      Doc={}
    }
    localstorage('add_document.html',JSON.stringify({action:"add_document_for_kyc_id",location:curr_page}))
    Doc.doc_name="Documento di Identità"
    Doc.doc_type="Documento di Identità"
    Doc.agency_id=localStorage.getItem('agencyId')
    Doc.per='contract'
    if ($scope.Kyc.contract_id===undefined && $scope.Kyc.contract_id>0)
    Doc.per_id=$scope.Kyc.contract_id;
    Doc.id=null
    Doc.image_name=null
    Doc.showOnlyImage=true
    Doc.indice=$scope.Kyc.contractor_data.Docs.length
    localstorage('Doc',JSON.stringify(Doc))
    localstorage('Contract',JSON.stringify($scope.Kyc.contractor_data))

    redirect('add_document.html')
    return;
  }
  $scope.edit_doc=function(Doc,indice){
    if (Doc===undefined){
      Doc={}
    }
    localstorage('add_document.html',JSON.stringify({action:"edit_document_for_kyc_id",location:curr_page}))
    Doc.doc_name="Documento di Identità"
    Doc.doc_type="Documento di Identità"
    Doc.agency_id=localStorage.getItem('agencyId')
    Doc.per='contract'
    if ($scope.Kyc.contract_id===undefined && $scope.Kyc.contract_id>0)
    Doc.per_id=$scope.Kyc.contract_id;
    Doc.indice=indice
    localstorage('Doc',JSON.stringify(Doc))
    localstorage('Contract',JSON.stringify($scope.Kyc.contractor_data))

    redirect('add_document.html')
    return;
  }
  $scope.deleteDoc=function(Doc )
  {
    navigator.notification.confirm(
        'Vuoi cancellare il Documento!', // message
        function(button) {
         if ( button == 1 ) {
             $scope.deleteDoc2(Doc);
         }
        },            // callback to invoke with index of button pressed
        'Sei sicuro?',           // title
        ['Si','No']     // buttonLabels
        );

  }
  $scope.deleteDoc2=function(Doc,indice){
    $http.post(SERVICEURL2,{action:'delete',table:'documents','primary':'id',id:Doc.id })
    //Doc.deleted=true;
    $scope.Kyc.contractor_data.Docs.splice(indice,indice);

  }

  $scope.back=function(passo){
    if (passo>0){
      localstorage('kycstep0'+passo+'.html',JSON.stringify({action:'',location:$scope.page.location, prev_page:curr_page}))
      redirect('kycstep0'+passo+'.html')
      return;
    }
    if (passo==-1){
      redirect($scope.page.prev_page)
      return;
    }
    redirect($scope.page.location)
  }

})
function onConfirm(buttonIndex,$scope,doc) {
    if (buttonIndex=1)
      $scope.deleteDoc(doc)
}
