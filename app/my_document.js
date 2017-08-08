app2.factory('Docs_inf', function($http,$state) {
  var Docs_inf = function() {
    this.Docs = [];
    this.busy = false;
    this.after = '';
    this.loaded=0;
    this.CompanyId=-1
    this.user_id=-1
    this.Contract={}
    this.Docload={}
  };

  Docs_inf.prototype.nextPage = function(agent) {
    if (this.busy || this.loaded==-1) return;
    this.busy = true;
    last=99999999999
    if ( this.Docs!==undefined && this.Docs.length>0){
      lastkey= Object.keys(this.Docs).pop() ;
      last=this.Docs[lastkey].id;
    }
    dbData=this.Docload
   data={ "action":"documentList", dbData:dbData,last:last,pInfo:{user_id:$scope.agent.user_id,agent_id:$scope.agent.id,agency_id:$scope.agent.agency_id,user_type:$scope.agent.user_type,priviledge:$scope.agent.priviledge,cookie:$scope.agent.cookie}}
    $http.post(SERVICEURL2,  data )
    .then(function(responceData)  {
      $('#loader_img').hide();
      if(responceData.data.RESPONSECODE=='1') 			{
        data=responceData.data.RESPONSE;
        angular.forEach(data,function(value,key) {
          image_type=['.png','.gif','.png','.tif','.bmp','.jpg']
          data[key].IMAGEURI=BASEURL+'uploads/document/'+data[key].per+'_'+data[key].per_id +'/resize/'
          data[key]['isImage']=false
          if(image_type.indexOf(data[key]['file_type']) !== -1) {
            data[key]['isImage']=true
          }

        })
        this.loaded=data.length
        if (last==99999999999)
        this.Docs=data;
        else
        this.Docs=this.Docs.concat(data);
        this.busy = false;
        if (data.length<5){
          this.loaded=-1
        }

      }

      else   {
        if (responceData.data.RESPONSECODE=='-1'){
          localstorage('msg','Sessione Scaduta ');
          $state.go('login');;;
        }
        this.busy = false;
        this.loaded=-1
        console.log('no docs')
      }
    }.bind(this))
    , (function() {
      this.busy = false;
      this.loaded=-1
      console.log("error");
    })


  }
  return Docs_inf;

});

app2.controller('my_document', function ($scope,$http,$translate, $state, Docs_inf,$timeout) {
  $scope.loader=true
  $scope.main.Back=true
  $scope.main.Add=true
	$scope.main.AddPage="add_document"
  $scope.main.Search=false
  $scope.main.Sidebar=false
  $scope.deleted=0
  $('.mdl-layout__drawer-button').hide()
  $scope.main.viewName="Documenti"

  $scope.page={}
  $scope.loader=true
  $scope.curr_page='my_document'
  page=localStorage.getItem($scope.curr_page)
  if ( page!= null && page.length >0 ){
    $scope.page=JSON.parse(page)
    $scope.action=$scope.page.action

  }
  $scope.main.location=$scope.curr_page

  console.log('action'+$scope.action);
  $scope.Docload={}
  switch ($scope.action){
    case 'list_from_view_contract' :
    $scope.Contract=JSON.parse(localStorage.getItem('Contract'))
    convertDateStringsToDates($scope.Contract)
    $scope.DocFor="CPU Contratto: " + $scope.Contract.CPU
    $scope.main.viewName="Documenti Contratto"
    $scope.Docload.per_id=$scope.Contract.contract_id
    $scope.Docload.per="contract"


    break;
    case 'list_from_my_company' :
    $scope.Company=JSON.parse(localStorage.getItem('Company'))
    convertDateStringsToDates($scope.Company)
    $scope.DocFor=$scope.Company.name;
    $scope.Docload.per_id=$scope.Company.company_id
    $scope.Docload.per="company"
    $scope.main.viewName="Documenti Società"
    $scope.main.action="add_document_for_company"


    break;
    case 'list_from_my_customer' :
    $scope.Customer=JSON.parse(localStorage.getItem('Customer'))
    convertDateStringsToDates($scope.Customer)
    $scope.DocFor=$scope.Customer.fullname;
    $scope.main.viewName="Documenti persona"
    $scope.Docload.per_id=$scope.Customer.user_id
    $scope.Docload.per="customer"
    $scope.main.action="add_document_for_customer"


    break;
    default :
    $scope.viewName="Documenti"
    break;
  }

/*  if ($scope.page.editDoc) {
    $scope.Docs_inf.Docs=JSON.parse(localStorage.getItem('Docs'))
    convertDateStringsToDates($scope.Docs_inf.Docs)
    Doc=JSON.parse(localStorage.getItem('Doc'))
    convertDateStringsToDates(Doc)
    $scope.Docs_inf.Docs[Doc.indice]=Doc
//    $scope.Kyc.contractor_data.Docs[Doc.indice]=Doc

  }

  else if ($scope.page.addDoc){
    $scope.Docs_inf.Docs=JSON.parse(localStorage.getItem('Docs'))
    convertDateStringsToDates($scope.Docs_inf.Docs)
    Doc=JSON.parse(localStorage.getItem('Doc'))
    convertDateStringsToDates(Doc)

    if ($scope.Docs_inf.Docs.length!==undefined|| $scope.Docs_inf.Docs.length>0 ){
        $scope.Docs_inf.Docs[Doc.indice]=Doc

    //  $scope.Docs[$scope.Kyc.contractor_data.Docs.length]=Doc
    }
    else {
      $scope.Docs_inf.Docs[Doc.indice]=Doc

      //$scope.Kyc.contractor_data.Docs={}
      //$scope.Kyc.contractor_data.Docs[0]=Doc
    }

  }

  else {
*/
    $scope.Docs_inf=new Docs_inf
    $scope.Docs_inf.Docload=$scope.Docload
/*
  }
*/

  $scope.imageurl=function(Doc){

    if (Doc===undefined || Doc.doc_image===undefined ||  Doc.doc_image== null || Doc.doc_image.length==0)
      imageurl= '../img/customer-listing1.png'
    else
      imageurl= BASEURL+ "file_down.php?action=file&file=" + Doc.doc_image +"&resize=1&doc_per="+ Doc.per+ "&per_id=" +Doc.per_id +"&agent_id="+ $scope.agent.id+"&cookie="+$scope.agent.cookie

    //  Customer.imageurl= Customer.IMAGEURI +Customer.image
    return   imageurl

  }
  $scope.deleteDoc=function(Doc,index )
  {
    if ($scope.main.web){
      r=confirm("Vuoi Cancellare il documento?");
      if (r == true) {
        $scope.deleteDoc2(Doc,index);
      }
    }
    else{
      navigator.notification.confirm(
        'Vuoi cancellare il Documento!', // message
        function(button) {
          if ( button == 1 ) {
            $scope.deleteDoc2(Doc,index);
          }
        },            // callback to invoke with index of button pressed
        'Sei sicuro?',           // title
        ['Si','No']     // buttonLabels
      );
    }

  }
  $scope.deleteDoc2=function(Doc,index){
    data={action:'delete',table:'documents','primary':'id',id:Doc.id,pInfo:{user_id:$scope.agent.user_id,agent_id:$scope.agent.id,agency_id:$scope.agent.agency_id,user_type:$scope.agent.user_type,priviledge:$scope.agent.priviledge,cookie:$scope.agent.cookie} }

    $http.post(SERVICEURL2,data)
    .then(function(responceData)  {
      console.log(responceData);
    })
    , (function(error) {
      console.log("error");
    })

    $state.reload();
  }
  $scope.download = function(Doc) {
     url=BASEURL + "file_down.php?action=file&file=" + Doc.doc_image +"&doc_per="+Doc.per+"&per_id="+Doc.per_id+"&isImage="+Doc.isImage+"&agent_id="+ $scope.agent.id+"&cookie="+$scope.agent.cookie
     $http.get(url, {
         responseType: "arraybuffer"
       })
       .then(function(data) {
         var anchor = angular.element('<a/>');
         angular.element(document.body).append(anchor);
         var ev = document.createEvent("MouseEvents");
         ev.initMouseEvent("click", true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
         anchor.attr({
           href: url,
           target: '_blank',
           download: Doc.doc_image
         })[0].dispatchEvent(ev);
       })
     }


  $scope.edit_doc=function(Doc,Index){
    switch($scope.page.action){
      case 'list_from_my_customer':
      localstorage('add_document',JSON.stringify({action:"edit_document_for_customer",location:$scope.curr_page}))
      localstorage('Doc',JSON.stringify(Doc))
      break
      case 'list_from_my_company':
      localstorage('add_document',JSON.stringify({action:"edit_document_for_customer",location:$scope.curr_page}))
      localstorage('Doc',JSON.stringify(Doc))
      break
      case 'list_from_view_contract' :
      localstorage('add_document',JSON.stringify({action:"edit_document_for_contract",location:$scope.curr_page}))
      localstorage('Doc',JSON.stringify(Doc))
      break;
      default:
    }
    Doc.indice=Index
    localstorage('Doc',JSON.stringify(Doc))
    $state.go('add_document')


  }
  $scope.back=function(){
    $state.go($scope.page.location)

  }
  $scope.$on('backButton', function(e) {
      $scope.back()
  });

  $scope.$on('addButton', function(e) {
     switch($scope.page.action){
       case 'list_from_my_customer':
       localstorage('add_document',JSON.stringify({action:"add_document_for_customer",location:$scope.curr_page}))
       Doc={agency_id:localStorage.getItem('agencyId'),per_id:$scope.Customer.user_id,per:'customer'}
       localstorage('Doc',JSON.stringify(Doc))
       break
       case 'list_from_my_company':
       localstorage('add_document',JSON.stringify({action:"add_document_for_company",location:$scope.curr_page}))
       Doc={agency_id:localStorage.getItem('agencyId'),per_id:$scope.Company.company_id,per:'company'}
       localstorage('Doc',JSON.stringify(Doc))
       break
       case 'list_from_view_contract' :
       localstorage('add_document',JSON.stringify({action:"add_document_for_contract",location:$scope.curr_page}))
       Doc={agency_id:localStorage.getItem('agencyId'),per_id:$scope.Contract.contract_id,per:'contract'}
       localstorage('Doc',JSON.stringify(Doc))
       break;
       default:
     }
     $state.go('add_document')
  })

  $scope.loader=false;
})
function onConfirm(buttonIndex,$scope,doc) {
  if (buttonIndex=1)
  $scope.deleteDoc(doc)
}
