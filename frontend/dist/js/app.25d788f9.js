(()=>{"use strict";var e={358:(e,t,a)=>{var o=a(751),l=a(641);function r(e,t,a,o,r,d){const s=(0,l.g2)("router-view");return(0,l.uX)(),(0,l.Wv)(s)}const d={name:"App"};var s=a(262);const i=(0,s.A)(d,[["render",r]]),n=i;var u=a(220),c=a(33);function m(e,t,a,r,d,s){const i=(0,l.g2)("v-card-title"),n=(0,l.g2)("v-text-field"),u=(0,l.g2)("v-btn"),m=(0,l.g2)("v-form"),h=(0,l.g2)("v-alert"),p=(0,l.g2)("v-card-text"),b=(0,l.g2)("v-card"),f=(0,l.g2)("v-col"),F=(0,l.g2)("v-row"),g=(0,l.g2)("v-container");return(0,l.uX)(),(0,l.Wv)(g,{class:"fill-height",fluid:""},{default:(0,l.k6)((()=>[(0,l.bF)(F,{align:"center",justify:"center"},{default:(0,l.k6)((()=>[(0,l.bF)(f,{cols:"12",sm:"8",md:"4"},{default:(0,l.k6)((()=>[(0,l.bF)(b,null,{default:(0,l.k6)((()=>[(0,l.bF)(i,{class:"justify-center"},{default:(0,l.k6)((()=>t[2]||(t[2]=[(0,l.Lk)("span",{class:"text-h5"},"Login",-1)]))),_:1}),(0,l.bF)(p,null,{default:(0,l.k6)((()=>[(0,l.bF)(m,{onSubmit:(0,o.D$)(s.doLogin,["prevent"])},{default:(0,l.k6)((()=>[(0,l.bF)(n,{modelValue:d.username,"onUpdate:modelValue":t[0]||(t[0]=e=>d.username=e),label:"Username",clearable:"",outlined:"",required:""},null,8,["modelValue"]),(0,l.bF)(n,{modelValue:d.password,"onUpdate:modelValue":t[1]||(t[1]=e=>d.password=e),label:"Password",type:"password",clearable:"",outlined:"",required:""},null,8,["modelValue"]),(0,l.bF)(u,{color:"primary",type:"submit",class:"mt-4",block:""},{default:(0,l.k6)((()=>t[3]||(t[3]=[(0,l.eW)(" Login ")]))),_:1})])),_:1},8,["onSubmit"]),d.error?((0,l.uX)(),(0,l.Wv)(h,{key:0,type:"error",class:"mt-4"},{default:(0,l.k6)((()=>[(0,l.eW)((0,c.v_)(d.error),1)])),_:1})):(0,l.Q3)("",!0)])),_:1})])),_:1})])),_:1})])),_:1})])),_:1})}var h=a(335);const p=h.A.create({baseURL:"http://127.0.0.1:18080/api"});p.interceptors.request.use((e=>{const t=localStorage.getItem("token");return t&&(e.headers.Authorization=`Bearer ${t}`),e}),(e=>Promise.reject(e)));const b={login(e,t){return p.post("/login",{username:e,password:t})},createUser(e){return p.post("/users",e)},getProfiles(){return p.get("/profiles")},createProfile(e){return p.post("/profiles",e)},getFeverMedication(e){return p.get("/fevermed",{params:e})},addFeverMedication(e){return p.post("/fevermed",e)},getDiseases(){return p.get("/diseases")},addDisease(e){return p.post("/diseases",e)},updateDisease(e,t){return p.put(`/diseases/${e}`,t)},generateReportPDF(e){return p.get("/reports/pdf",{params:e,responseType:"blob"})},getMedications(){return p.get("/medications")},addMedication(e){return p.post("/medications",e)},updateMedication(e,t){return p.put(`/medications/${e}`,t)},deleteMedication(e){return p.delete(`/medications/${e}`)},getFeverThresholds(){return p.get("/feverthresholds")},addFeverThreshold(e){return p.post("/feverthresholds",e)},updateFeverThreshold(e,t){return p.put(`/feverthresholds/${e}`,t)},deleteFeverThreshold(e){return p.delete(`/feverthresholds/${e}`)}},f={name:"Login",data(){return{username:"",password:"",error:""}},methods:{doLogin(){this.error="",b.login(this.username,this.password).then((e=>{localStorage.setItem("token",e.data.token),this.$router.push("/dashboard/select-profile")})).catch((e=>{this.error=e.response?.data?.error||"Erro de login"}))}}},F=(0,s.A)(f,[["render",m],["__scopeId","data-v-fe26c772"]]),g=F;function v(e,t,a,o,r,d){const s=(0,l.g2)("NavBar"),i=(0,l.g2)("router-view"),n=(0,l.g2)("v-main"),u=(0,l.g2)("v-app");return(0,l.uX)(),(0,l.Wv)(u,null,{default:(0,l.k6)((()=>[(0,l.bF)(s),(0,l.bF)(n,null,{default:(0,l.k6)((()=>[(0,l.bF)(i)])),_:1})])),_:1})}function _(e,t,a,o,r,d){const s=(0,l.g2)("v-toolbar-title"),i=(0,l.g2)("v-spacer"),n=(0,l.g2)("v-btn"),u=(0,l.g2)("v-app-bar");return(0,l.uX)(),(0,l.Wv)(u,{app:"",color:"primary",dark:""},{default:(0,l.k6)((()=>[(0,l.bF)(s,null,{default:(0,l.k6)((()=>t[5]||(t[5]=[(0,l.eW)("Meu Site Saúde")]))),_:1}),(0,l.bF)(i),(0,l.bF)(n,{text:"",onClick:t[0]||(t[0]=e=>d.goTo("select-profile"))},{default:(0,l.k6)((()=>t[6]||(t[6]=[(0,l.eW)("Mudar Perfil")]))),_:1}),(0,l.bF)(n,{text:"",onClick:t[1]||(t[1]=e=>d.goTo("health-fever"))},{default:(0,l.k6)((()=>t[7]||(t[7]=[(0,l.eW)("Febre e Medicação")]))),_:1}),(0,l.bF)(n,{text:"",onClick:t[2]||(t[2]=e=>d.goTo("health-diseases"))},{default:(0,l.k6)((()=>t[8]||(t[8]=[(0,l.eW)("Doenças")]))),_:1}),(0,l.bF)(n,{text:"",onClick:t[3]||(t[3]=e=>d.goTo("health-reports"))},{default:(0,l.k6)((()=>t[9]||(t[9]=[(0,l.eW)("Relatórios")]))),_:1}),(0,l.bF)(n,{text:"",onClick:t[4]||(t[4]=e=>d.goTo("management"))},{default:(0,l.k6)((()=>t[10]||(t[10]=[(0,l.eW)("Gestão")]))),_:1}),(0,l.bF)(n,{text:"",onClick:d.logout},{default:(0,l.k6)((()=>t[11]||(t[11]=[(0,l.eW)("Sair")]))),_:1},8,["onClick"])])),_:1})}const k={name:"NavBar",methods:{goTo(e){this.$router.push(`/dashboard/${e}`)},logout(){localStorage.removeItem("token"),this.$router.push("/login")}}},D=(0,s.A)(k,[["render",_],["__scopeId","data-v-313bb958"]]),w=D,T={name:"Dashboard",components:{NavBar:w}},M=(0,s.A)(T,[["render",v],["__scopeId","data-v-b66192dc"]]),V=M,y={key:0},x={key:1};function C(e,t,a,r,d,s){const i=(0,l.g2)("v-spacer"),n=(0,l.g2)("v-btn"),u=(0,l.g2)("v-card-title"),m=(0,l.g2)("v-text-field"),h=(0,l.g2)("v-col"),p=(0,l.g2)("v-select"),b=(0,l.g2)("v-row"),f=(0,l.g2)("FeverMedicationChart"),F=(0,l.g2)("v-data-table"),g=(0,l.g2)("v-card-text"),v=(0,l.g2)("v-card"),_=(0,l.g2)("v-date-picker"),k=(0,l.g2)("v-menu"),D=(0,l.g2)("v-form"),w=(0,l.g2)("v-dialog"),T=(0,l.g2)("v-container");return(0,l.uX)(),(0,l.Wv)(T,{class:"py-12"},{default:(0,l.k6)((()=>[(0,l.bF)(b,null,{default:(0,l.k6)((()=>[(0,l.bF)(h,{cols:"12"},{default:(0,l.k6)((()=>[(0,l.bF)(v,null,{default:(0,l.k6)((()=>[(0,l.bF)(u,null,{default:(0,l.k6)((()=>[t[13]||(t[13]=(0,l.eW)(" Febre e Medicação ")),(0,l.bF)(i),(0,l.bF)(n,{color:"primary",onClick:t[0]||(t[0]=e=>d.showAddDialog=!0)},{default:(0,l.k6)((()=>t[12]||(t[12]=[(0,l.eW)("Adicionar Registo")]))),_:1})])),_:1}),(0,l.bF)(g,null,{default:(0,l.k6)((()=>[(0,l.bF)(b,null,{default:(0,l.k6)((()=>[(0,l.bF)(h,{cols:"12",sm:"4"},{default:(0,l.k6)((()=>[(0,l.bF)(m,{modelValue:d.filters.startDate,"onUpdate:modelValue":t[1]||(t[1]=e=>d.filters.startDate=e),label:"Data Início",type:"date"},null,8,["modelValue"])])),_:1}),(0,l.bF)(h,{cols:"12",sm:"4"},{default:(0,l.k6)((()=>[(0,l.bF)(m,{modelValue:d.filters.endDate,"onUpdate:modelValue":t[2]||(t[2]=e=>d.filters.endDate=e),label:"Data Fim",type:"date"},null,8,["modelValue"])])),_:1}),(0,l.bF)(h,{cols:"12",sm:"4"},{default:(0,l.k6)((()=>[(0,l.bF)(p,{modelValue:d.filters.diseaseID,"onUpdate:modelValue":t[3]||(t[3]=e=>d.filters.diseaseID=e),items:d.diseases,"item-text":"name","item-value":"id",label:"Doença",clearable:""},null,8,["modelValue","items"])])),_:1}),(0,l.bF)(h,{cols:"12"},{default:(0,l.k6)((()=>[(0,l.bF)(n,{color:"secondary",onClick:s.loadRecords},{default:(0,l.k6)((()=>t[14]||(t[14]=[(0,l.eW)("Filtrar")]))),_:1},8,["onClick"])])),_:1})])),_:1}),(0,l.bF)(b,null,{default:(0,l.k6)((()=>[(0,l.bF)(h,{cols:"12"},{default:(0,l.k6)((()=>[(0,l.bF)(f,{startDate:d.filters.startDate,endDate:d.filters.endDate,diseaseID:d.filters.diseaseID},null,8,["startDate","endDate","diseaseID"])])),_:1})])),_:1}),(0,l.bF)(F,{headers:d.headers,items:d.records,class:"elevation-1"},{"item.disease_name":(0,l.k6)((({item:e})=>[e.disease_name?((0,l.uX)(),(0,l.CE)("span",y,(0,c.v_)(e.disease_name),1)):((0,l.uX)(),(0,l.CE)("span",x,"-"))])),_:1},8,["headers","items"])])),_:1})])),_:1})])),_:1})])),_:1}),(0,l.bF)(w,{modelValue:d.showAddDialog,"onUpdate:modelValue":t[11]||(t[11]=e=>d.showAddDialog=e),"max-width":"600px"},{default:(0,l.k6)((()=>[(0,l.bF)(v,null,{default:(0,l.k6)((()=>[(0,l.bF)(u,null,{default:(0,l.k6)((()=>t[15]||(t[15]=[(0,l.Lk)("span",{class:"text-h5"},"Adicionar Registo",-1)]))),_:1}),(0,l.bF)(g,null,{default:(0,l.k6)((()=>[(0,l.bF)(D,{onSubmit:(0,o.D$)(s.addRecord,["prevent"])},{default:(0,l.k6)((()=>[(0,l.bF)(b,null,{default:(0,l.k6)((()=>[(0,l.bF)(h,{cols:"12",sm:"6"},{default:(0,l.k6)((()=>[(0,l.bF)(m,{modelValue:d.newRecord.temperature,"onUpdate:modelValue":t[4]||(t[4]=e=>d.newRecord.temperature=e),label:"Temperatura (°C)",type:"number",step:"0.1"},null,8,["modelValue"])])),_:1}),(0,l.bF)(h,{cols:"12",sm:"6"},{default:(0,l.k6)((()=>[(0,l.bF)(p,{modelValue:d.newRecord.medication,"onUpdate:modelValue":t[5]||(t[5]=e=>d.newRecord.medication=e),items:d.medications,"item-text":"name","item-value":"name",label:"Medicação",clearable:""},null,8,["modelValue","items"])])),_:1}),(0,l.bF)(h,{cols:"12",sm:"6"},{default:(0,l.k6)((()=>[(0,l.bF)(k,{ref:"menu",modelValue:d.menu,"onUpdate:modelValue":t[8]||(t[8]=e=>d.menu=e),"close-on-content-click":!1,"nudge-right":40,transition:"scale-transition","offset-y":"","min-width":"auto"},{activator:(0,l.k6)((({on:e,attrs:a})=>[(0,l.bF)(m,(0,l.v6)({modelValue:d.newRecord.date_time,"onUpdate:modelValue":t[6]||(t[6]=e=>d.newRecord.date_time=e),label:"Data/Hora","prepend-icon":"mdi-calendar",readonly:""},a,(0,l.Tb)(e)),null,16,["modelValue"])])),default:(0,l.k6)((()=>[(0,l.bF)(_,{modelValue:d.date,"onUpdate:modelValue":t[7]||(t[7]=e=>d.date=e),onInput:s.saveDate},null,8,["modelValue","onInput"])])),_:1},8,["modelValue"])])),_:1}),(0,l.bF)(h,{cols:"12",sm:"6"},{default:(0,l.k6)((()=>[(0,l.bF)(p,{modelValue:d.newRecord.disease_id,"onUpdate:modelValue":t[9]||(t[9]=e=>d.newRecord.disease_id=e),items:d.diseases,"item-text":"name","item-value":"id",label:"Doença",clearable:""},null,8,["modelValue","items"])])),_:1})])),_:1}),(0,l.bF)(n,{color:"primary",type:"submit"},{default:(0,l.k6)((()=>t[16]||(t[16]=[(0,l.eW)("Adicionar")]))),_:1}),(0,l.bF)(n,{color:"secondary",onClick:t[10]||(t[10]=e=>d.showAddDialog=!1)},{default:(0,l.k6)((()=>t[17]||(t[17]=[(0,l.eW)("Cancelar")]))),_:1})])),_:1},8,["onSubmit"])])),_:1})])),_:1})])),_:1},8,["modelValue"])])),_:1})}const A={key:0},E={key:1};function W(e,t,a,o,r,d){const s=(0,l.g2)("v-card-title"),i=(0,l.g2)("vue-apex-charts"),n=(0,l.g2)("v-progress-circular"),u=(0,l.g2)("v-card-text"),c=(0,l.g2)("v-card");return(0,l.uX)(),(0,l.Wv)(c,null,{default:(0,l.k6)((()=>[(0,l.bF)(s,null,{default:(0,l.k6)((()=>t[0]||(t[0]=[(0,l.eW)("Gráfico de Febre e Medicação")]))),_:1}),(0,l.bF)(u,null,{default:(0,l.k6)((()=>[e.chartOptions&&e.series.length?((0,l.uX)(),(0,l.CE)("div",A,[(0,l.bF)(i,{type:"line",height:"400",options:e.chartOptions,series:e.series},null,8,["options","series"])])):((0,l.uX)(),(0,l.CE)("div",E,[(0,l.bF)(n,{indeterminate:"",color:"primary"})]))])),_:1})])),_:1})}var I=a(953),$=a(79);const U=(0,l.pM)({name:"FeverMedicationChart",components:{VueApexCharts:$.A},props:{startDate:{type:String,default:""},endDate:{type:String,default:""},diseaseID:{type:String,default:""}},setup(e){const t=(0,I.KR)([]),a=(0,I.KR)({}),o=async()=>{try{const t={};e.startDate&&(t.start=e.startDate),e.endDate&&(t.end=e.endDate),e.diseaseID&&(t.disease_id=e.diseaseID);const[a,o,l]=await Promise.all([b.getFeverMedication(t),b.getMedications(),b.getFeverThresholds()]),d=a.data,s=o.data,i=l.data;r(d,s,i)}catch(t){console.error("Erro ao carregar dados do gráfico:",t)}},r=(e,o,l)=>{if(0===e.length)return t.value=[],void(a.value={});const r=e.sort(((e,t)=>new Date(e.date_time)-new Date(t.date_time))),d=r.map((e=>({x:new Date(e.date_time),y:e.temperature})));t.value=[{name:"Temperatura",type:"line",data:d}];const s=o.map((e=>({x:e.date_time,borderColor:e.color,strokeDashArray:0,label:{borderColor:e.color,style:{color:"#fff",background:e.color},text:e.name}}))),i=l.map((e=>({y:e.min_temp,y2:e.max_temp,fillColor:e.color,opacity:.1,borderWidth:0})));a.value={chart:{type:"line",height:400,toolbar:{show:!0}},annotations:{xaxis:s,yaxis:i},stroke:{width:[3],curve:"straight"},xaxis:{type:"datetime",title:{text:"Data"}},yaxis:{title:{text:"Temperatura (°C)"},min:35,max:42},tooltip:{shared:!0,intersect:!1,x:{format:"dd/MM/yyyy HH:mm"}},markers:{size:5},responsive:[{breakpoint:600,options:{chart:{height:300},legend:{position:"bottom"}}}],legend:{position:"top",horizontalAlign:"left"}}};return(0,l.sV)((()=>{o()})),(0,l.wB)((()=>[e.startDate,e.endDate,e.diseaseID]),(()=>{o()})),{series:t,chartOptions:a}}}),S=(0,s.A)(U,[["render",W],["__scopeId","data-v-33e60eab"]]),R=S,P={name:"HealthFever",components:{FeverMedicationChart:R},data(){return{filters:{startDate:"",endDate:"",diseaseID:""},records:[],diseases:[],medications:[],headers:[{text:"Data/Hora",value:"date_time"},{text:"Temperatura",value:"temperature"},{text:"Medicação",value:"medication"},{text:"Doença",value:"disease_name"}],showAddDialog:!1,newRecord:{temperature:"",medication:"",date_time:"",disease_id:""},menu:!1,date:null}},created(){this.loadDiseases(),this.loadMedications(),this.loadRecords()},methods:{loadRecords(){const e={};this.filters.startDate&&(e.start=this.filters.startDate),this.filters.endDate&&(e.end=this.filters.endDate),this.filters.diseaseID&&(e.disease_id=this.filters.diseaseID),b.getFeverMedication(e).then((e=>{this.records=e.data})).catch((()=>{this.$toast.error("Erro ao carregar registos.")}))},loadDiseases(){b.getDiseases().then((e=>{this.diseases=e.data})).catch((()=>{this.$toast.error("Erro ao carregar doenças.")}))},loadMedications(){b.getMedications().then((e=>{this.medications=e.data.map((e=>e.name))})).catch((()=>{this.$toast.error("Erro ao carregar medicações.")}))},addRecord(){const e=localStorage.getItem("currentProfileId");if(!e)return void this.$toast.error("Selecione um perfil primeiro");const t={profile_id:parseInt(e),temperature:this.newRecord.temperature||null,medication:this.newRecord.medication||null,date_time:this.newRecord.date_time||(new Date).toISOString(),disease_id:this.newRecord.disease_id?parseInt(this.newRecord.disease_id):null};b.addFeverMedication(t).then((()=>{this.$toast.success("Registo adicionado!"),this.showAddDialog=!1,this.loadRecords()})).catch((()=>{this.$toast.error("Erro ao adicionar registo.")}))},saveDate(e){const t=new Date(e);t.setHours(12,0,0,0),this.newRecord.date_time=t.toISOString(),this.menu=!1}}},L=(0,s.A)(P,[["render",C],["__scopeId","data-v-0643e4af"]]),O=L,X={key:0},j={key:1};function q(e,t,a,r,d,s){const i=(0,l.g2)("v-spacer"),n=(0,l.g2)("v-btn"),u=(0,l.g2)("v-card-title"),m=(0,l.g2)("v-data-table"),h=(0,l.g2)("v-card-text"),p=(0,l.g2)("v-card"),b=(0,l.g2)("v-col"),f=(0,l.g2)("v-row"),F=(0,l.g2)("v-text-field"),g=(0,l.g2)("v-date-picker"),v=(0,l.g2)("v-menu"),_=(0,l.g2)("v-form"),k=(0,l.g2)("v-dialog"),D=(0,l.g2)("v-container");return(0,l.uX)(),(0,l.Wv)(D,{class:"py-12"},{default:(0,l.k6)((()=>[(0,l.bF)(f,null,{default:(0,l.k6)((()=>[(0,l.bF)(b,{cols:"12"},{default:(0,l.k6)((()=>[(0,l.bF)(p,null,{default:(0,l.k6)((()=>[(0,l.bF)(u,null,{default:(0,l.k6)((()=>[t[10]||(t[10]=(0,l.eW)(" Doenças ")),(0,l.bF)(i),(0,l.bF)(n,{color:"primary",onClick:t[0]||(t[0]=e=>d.showAddDialog=!0)},{default:(0,l.k6)((()=>t[9]||(t[9]=[(0,l.eW)("Adicionar Doença")]))),_:1})])),_:1}),(0,l.bF)(h,null,{default:(0,l.k6)((()=>[(0,l.bF)(m,{headers:d.headers,items:d.diseases,class:"elevation-1"},{"item.end_date":(0,l.k6)((({item:e})=>[e.end_date?((0,l.uX)(),(0,l.CE)("span",X,(0,c.v_)(s.formatDate(e.end_date)),1)):((0,l.uX)(),(0,l.CE)("span",j,"Em curso..."))])),_:1},8,["headers","items"])])),_:1})])),_:1})])),_:1})])),_:1}),(0,l.bF)(k,{modelValue:d.showAddDialog,"onUpdate:modelValue":t[8]||(t[8]=e=>d.showAddDialog=e),"max-width":"600px"},{default:(0,l.k6)((()=>[(0,l.bF)(p,null,{default:(0,l.k6)((()=>[(0,l.bF)(u,null,{default:(0,l.k6)((()=>t[11]||(t[11]=[(0,l.Lk)("span",{class:"text-h5"},"Adicionar Doença",-1)]))),_:1}),(0,l.bF)(h,null,{default:(0,l.k6)((()=>[(0,l.bF)(_,{onSubmit:(0,o.D$)(s.addDisease,["prevent"])},{default:(0,l.k6)((()=>[(0,l.bF)(f,null,{default:(0,l.k6)((()=>[(0,l.bF)(b,{cols:"12"},{default:(0,l.k6)((()=>[(0,l.bF)(F,{modelValue:d.newDisease.name,"onUpdate:modelValue":t[1]||(t[1]=e=>d.newDisease.name=e),label:"Nome da Doença",required:""},null,8,["modelValue"])])),_:1}),(0,l.bF)(b,{cols:"12",sm:"6"},{default:(0,l.k6)((()=>[(0,l.bF)(v,{ref:"startMenu",modelValue:d.startMenu,"onUpdate:modelValue":t[4]||(t[4]=e=>d.startMenu=e),"close-on-content-click":!1,"nudge-right":40,transition:"scale-transition","offset-y":"","min-width":"auto"},{activator:(0,l.k6)((({on:e,attrs:a})=>[(0,l.bF)(F,(0,l.v6)({modelValue:d.newDisease.start_date,"onUpdate:modelValue":t[2]||(t[2]=e=>d.newDisease.start_date=e),label:"Data Início","prepend-icon":"mdi-calendar",readonly:""},a,(0,l.Tb)(e)),null,16,["modelValue"])])),default:(0,l.k6)((()=>[(0,l.bF)(g,{modelValue:d.startDate,"onUpdate:modelValue":t[3]||(t[3]=e=>d.startDate=e),onInput:s.saveStartDate},null,8,["modelValue","onInput"])])),_:1},8,["modelValue"])])),_:1}),(0,l.bF)(b,{cols:"12",sm:"6"},{default:(0,l.k6)((()=>[(0,l.bF)(v,{ref:"endMenu",modelValue:d.endMenu,"onUpdate:modelValue":t[7]||(t[7]=e=>d.endMenu=e),"close-on-content-click":!1,"nudge-right":40,transition:"scale-transition","offset-y":"","min-width":"auto"},{activator:(0,l.k6)((({on:e,attrs:a})=>[(0,l.bF)(F,(0,l.v6)({modelValue:d.newDisease.end_date,"onUpdate:modelValue":t[5]||(t[5]=e=>d.newDisease.end_date=e),label:"Data Fim","prepend-icon":"mdi-calendar",readonly:""},a,(0,l.Tb)(e)),null,16,["modelValue"])])),default:(0,l.k6)((()=>[(0,l.bF)(g,{modelValue:d.endDate,"onUpdate:modelValue":t[6]||(t[6]=e=>d.endDate=e),onInput:s.saveEndDate},null,8,["modelValue","onInput"])])),_:1},8,["modelValue"])])),_:1})])),_:1}),(0,l.bF)(n,{color:"primary",type:"submit"},{default:(0,l.k6)((()=>t[12]||(t[12]=[(0,l.eW)("Adicionar")]))),_:1}),(0,l.bF)(n,{color:"secondary",onClick:s.closeAddDialog},{default:(0,l.k6)((()=>t[13]||(t[13]=[(0,l.eW)("Cancelar")]))),_:1},8,["onClick"])])),_:1},8,["onSubmit"])])),_:1})])),_:1})])),_:1},8,["modelValue"])])),_:1})}const H={name:"HealthDiseases",data(){return{diseases:[],headers:[{text:"ID",value:"id"},{text:"Nome",value:"name"},{text:"Data Início",value:"start_date"},{text:"Data Fim",value:"end_date"}],showAddDialog:!1,newDisease:{name:"",start_date:"",end_date:""},startMenu:!1,endMenu:!1,startDate:null,endDate:null}},created(){this.loadDiseases()},methods:{loadDiseases(){b.getDiseases().then((e=>{this.diseases=e.data})).catch((()=>{this.$toast.error("Erro ao carregar doenças.")}))},addDisease(){const e={name:this.newDisease.name,start_date:this.newDisease.start_date,end_date:this.newDisease.end_date||null};b.addDisease(e).then((()=>{this.$toast.success("Doença adicionada."),this.showAddDialog=!1,this.loadDiseases()})).catch((e=>{const t=e.response?.data?.error||"Erro ao adicionar doença.";this.$toast.error(t)}))},saveStartDate(e){this.newDisease.start_date=e,this.startMenu=!1},saveEndDate(e){this.newDisease.end_date=e,this.endMenu=!1},closeAddDialog(){this.showAddDialog=!1},formatDate(e){const t=new Date(e);return t.toLocaleDateString()}}},z=(0,s.A)(H,[["render",q],["__scopeId","data-v-0229c2b3"]]),N=z,G={class:"health-reports"};function B(e,t,a,o,r,d){return(0,l.uX)(),(0,l.CE)("div",G,[t[1]||(t[1]=(0,l.Lk)("h2",null,"Relatórios",-1)),t[2]||(t[2]=(0,l.Lk)("p",null,"Clique no botão para gerar relatório (simulado).",-1)),(0,l.Lk)("button",{onClick:t[0]||(t[0]=(...e)=>d.generate&&d.generate(...e))},"Gerar Relatório"),(0,l.Lk)("p",null,(0,c.v_)(r.message),1)])}const K={name:"HealthReports",data(){return{message:""}},methods:{generate(){b.generateReport().then((e=>{this.message=e.data.message})).catch((()=>{this.message="Erro ao gerar relatório."}))}}},Q=(0,s.A)(K,[["render",B]]),J=Q,Y={class:"text-h5"},Z={class:"text-h5"};function ee(e,t,a,r,d,s){const i=(0,l.g2)("v-card-title"),n=(0,l.g2)("v-text-field"),u=(0,l.g2)("v-btn"),m=(0,l.g2)("v-form"),h=(0,l.g2)("v-card-text"),p=(0,l.g2)("v-card"),b=(0,l.g2)("v-col"),f=(0,l.g2)("v-row"),F=(0,l.g2)("v-data-table"),g=(0,l.g2)("v-dialog"),v=(0,l.g2)("v-card-actions"),_=(0,l.g2)("v-container");return(0,l.uX)(),(0,l.Wv)(_,{class:"py-12"},{default:(0,l.k6)((()=>[(0,l.bF)(f,null,{default:(0,l.k6)((()=>[(0,l.bF)(b,{cols:"12",md:"6"},{default:(0,l.k6)((()=>[(0,l.bF)(p,null,{default:(0,l.k6)((()=>[(0,l.bF)(i,null,{default:(0,l.k6)((()=>t[13]||(t[13]=[(0,l.eW)("Criar Novo Utilizador")]))),_:1}),(0,l.bF)(h,null,{default:(0,l.k6)((()=>[(0,l.bF)(m,{onSubmit:(0,o.D$)(e.createUser,["prevent"])},{default:(0,l.k6)((()=>[(0,l.bF)(n,{modelValue:d.newUser.username,"onUpdate:modelValue":t[0]||(t[0]=e=>d.newUser.username=e),label:"Username",required:""},null,8,["modelValue"]),(0,l.bF)(n,{modelValue:d.newUser.password,"onUpdate:modelValue":t[1]||(t[1]=e=>d.newUser.password=e),label:"Password",type:"password",required:""},null,8,["modelValue"]),(0,l.bF)(u,{color:"primary",type:"submit"},{default:(0,l.k6)((()=>t[14]||(t[14]=[(0,l.eW)("Criar")]))),_:1})])),_:1},8,["onSubmit"])])),_:1})])),_:1})])),_:1}),(0,l.bF)(b,{cols:"12",md:"6"},{default:(0,l.k6)((()=>[(0,l.bF)(p,null,{default:(0,l.k6)((()=>[(0,l.bF)(i,null,{default:(0,l.k6)((()=>t[15]||(t[15]=[(0,l.eW)("Criar Novo Perfil")]))),_:1}),(0,l.bF)(h,null,{default:(0,l.k6)((()=>[(0,l.bF)(m,{onSubmit:(0,o.D$)(e.createProfile,["prevent"])},{default:(0,l.k6)((()=>[(0,l.bF)(n,{modelValue:d.newProfile.name,"onUpdate:modelValue":t[2]||(t[2]=e=>d.newProfile.name=e),label:"Nome do Perfil",required:""},null,8,["modelValue"]),(0,l.bF)(u,{color:"primary",type:"submit"},{default:(0,l.k6)((()=>t[16]||(t[16]=[(0,l.eW)("Criar")]))),_:1})])),_:1},8,["onSubmit"])])),_:1})])),_:1})])),_:1})])),_:1}),(0,l.bF)(f,null,{default:(0,l.k6)((()=>[(0,l.bF)(b,{cols:"12",md:"6"},{default:(0,l.k6)((()=>[(0,l.bF)(p,null,{default:(0,l.k6)((()=>[(0,l.bF)(i,null,{default:(0,l.k6)((()=>t[17]||(t[17]=[(0,l.eW)("Gestão de Medicações")]))),_:1}),(0,l.bF)(h,null,{default:(0,l.k6)((()=>[(0,l.bF)(F,{headers:d.medHeaders,items:d.medications,class:"elevation-1"},{"item.actions":(0,l.k6)((({item:e})=>[(0,l.bF)(u,{small:"",color:"blue",onClick:t=>s.editMedication(e)},{default:(0,l.k6)((()=>t[18]||(t[18]=[(0,l.eW)("Editar")]))),_:2},1032,["onClick"]),(0,l.bF)(u,{small:"",color:"red",onClick:t=>s.deleteMedication(e.id)},{default:(0,l.k6)((()=>t[19]||(t[19]=[(0,l.eW)("Deletar")]))),_:2},1032,["onClick"])])),_:1},8,["headers","items"]),(0,l.bF)(g,{modelValue:d.showMedDialog,"onUpdate:modelValue":t[6]||(t[6]=e=>d.showMedDialog=e),"max-width":"500px"},{default:(0,l.k6)((()=>[(0,l.bF)(p,null,{default:(0,l.k6)((()=>[(0,l.bF)(i,null,{default:(0,l.k6)((()=>[(0,l.Lk)("span",Y,(0,c.v_)(d.isEditingMed?"Editar Medicação":"Adicionar Medicação"),1)])),_:1}),(0,l.bF)(h,null,{default:(0,l.k6)((()=>[(0,l.bF)(m,{onSubmit:t[5]||(t[5]=(0,o.D$)((e=>d.isEditingMed?s.updateMedicationAction():s.addMedicationAction()),["prevent"]))},{default:(0,l.k6)((()=>[(0,l.bF)(n,{modelValue:d.currentMed.name,"onUpdate:modelValue":t[3]||(t[3]=e=>d.currentMed.name=e),label:"Nome da Medicação",required:""},null,8,["modelValue"]),(0,l.bF)(n,{modelValue:d.currentMed.color,"onUpdate:modelValue":t[4]||(t[4]=e=>d.currentMed.color=e),label:"Cor da Medicação (Hex)",required:"",rules:[e=>/^#([A-Fa-f0-9]{6})$/.test(e)||"Cor inválida"]},null,8,["modelValue","rules"]),(0,l.bF)(u,{color:"primary",type:"submit"},{default:(0,l.k6)((()=>[(0,l.eW)((0,c.v_)(d.isEditingMed?"Atualizar":"Adicionar"),1)])),_:1}),(0,l.bF)(u,{color:"secondary",onClick:s.closeMedDialog},{default:(0,l.k6)((()=>t[20]||(t[20]=[(0,l.eW)("Cancelar")]))),_:1},8,["onClick"])])),_:1})])),_:1})])),_:1})])),_:1},8,["modelValue"])])),_:1}),(0,l.bF)(v,null,{default:(0,l.k6)((()=>[(0,l.bF)(u,{color:"primary",onClick:s.openAddMedDialog},{default:(0,l.k6)((()=>t[21]||(t[21]=[(0,l.eW)("Adicionar Medicação")]))),_:1},8,["onClick"])])),_:1})])),_:1})])),_:1}),(0,l.bF)(b,{cols:"12",md:"6"},{default:(0,l.k6)((()=>[(0,l.bF)(p,null,{default:(0,l.k6)((()=>[(0,l.bF)(i,null,{default:(0,l.k6)((()=>t[22]||(t[22]=[(0,l.eW)("Gestão de Fever Thresholds")]))),_:1}),(0,l.bF)(h,null,{default:(0,l.k6)((()=>[(0,l.bF)(F,{headers:d.ftHeaders,items:d.feverThresholds,class:"elevation-1"},{"item.actions":(0,l.k6)((({item:e})=>[(0,l.bF)(u,{small:"",color:"blue",onClick:t=>s.editFeverThreshold(e)},{default:(0,l.k6)((()=>t[23]||(t[23]=[(0,l.eW)("Editar")]))),_:2},1032,["onClick"]),(0,l.bF)(u,{small:"",color:"red",onClick:t=>s.deleteFeverThreshold(e.id)},{default:(0,l.k6)((()=>t[24]||(t[24]=[(0,l.eW)("Deletar")]))),_:2},1032,["onClick"])])),_:1},8,["headers","items"]),(0,l.bF)(g,{modelValue:d.showFTDialog,"onUpdate:modelValue":t[12]||(t[12]=e=>d.showFTDialog=e),"max-width":"600px"},{default:(0,l.k6)((()=>[(0,l.bF)(p,null,{default:(0,l.k6)((()=>[(0,l.bF)(i,null,{default:(0,l.k6)((()=>[(0,l.Lk)("span",Z,(0,c.v_)(d.isEditingFT?"Editar Fever Threshold":"Adicionar Fever Threshold"),1)])),_:1}),(0,l.bF)(h,null,{default:(0,l.k6)((()=>[(0,l.bF)(m,{onSubmit:t[11]||(t[11]=(0,o.D$)((e=>d.isEditingFT?s.updateFeverThresholdAction():s.addFeverThresholdAction()),["prevent"]))},{default:(0,l.k6)((()=>[(0,l.bF)(n,{modelValue:d.currentFT.label,"onUpdate:modelValue":t[7]||(t[7]=e=>d.currentFT.label=e),label:"Label",required:""},null,8,["modelValue"]),(0,l.bF)(n,{modelValue:d.currentFT.min_temp,"onUpdate:modelValue":t[8]||(t[8]=e=>d.currentFT.min_temp=e),label:"Temperatura Mínima (°C)",type:"number",step:"0.1",required:""},null,8,["modelValue"]),(0,l.bF)(n,{modelValue:d.currentFT.max_temp,"onUpdate:modelValue":t[9]||(t[9]=e=>d.currentFT.max_temp=e),label:"Temperatura Máxima (°C)",type:"number",step:"0.1",required:""},null,8,["modelValue"]),(0,l.bF)(n,{modelValue:d.currentFT.color,"onUpdate:modelValue":t[10]||(t[10]=e=>d.currentFT.color=e),label:"Cor da Faixa (Hex)",required:"",rules:[e=>/^#([A-Fa-f0-9]{6})$/.test(e)||"Cor inválida"]},null,8,["modelValue","rules"]),(0,l.bF)(u,{color:"primary",type:"submit"},{default:(0,l.k6)((()=>[(0,l.eW)((0,c.v_)(d.isEditingFT?"Atualizar":"Adicionar"),1)])),_:1}),(0,l.bF)(u,{color:"secondary",onClick:s.closeFTDialog},{default:(0,l.k6)((()=>t[25]||(t[25]=[(0,l.eW)("Cancelar")]))),_:1},8,["onClick"])])),_:1})])),_:1})])),_:1})])),_:1},8,["modelValue"])])),_:1}),(0,l.bF)(v,null,{default:(0,l.k6)((()=>[(0,l.bF)(u,{color:"primary",onClick:s.openAddFTDialog},{default:(0,l.k6)((()=>t[26]||(t[26]=[(0,l.eW)("Adicionar Fever Threshold")]))),_:1},8,["onClick"])])),_:1})])),_:1})])),_:1})])),_:1})])),_:1})}const te={name:"Management",data(){return{newUser:{username:"",password:""},newProfile:{name:""},medications:[],medHeaders:[{text:"ID",value:"id"},{text:"Nome",value:"name"},{text:"Cor",value:"color"},{text:"Ações",value:"actions",sortable:!1}],showMedDialog:!1,isEditingMed:!1,currentMed:{id:null,name:"",color:""},feverThresholds:[],ftHeaders:[{text:"ID",value:"id"},{text:"Label",value:"label"},{text:"Temp Mínima",value:"min_temp"},{text:"Temp Máxima",value:"max_temp"},{text:"Cor",value:"color"},{text:"Ações",value:"actions",sortable:!1}],showFTDialog:!1,isEditingFT:!1,currentFT:{id:null,label:"",min_temp:"",max_temp:"",color:""}}},created(){this.loadMedications(),this.loadFeverThresholds()},methods:{loadMedications(){b.getMedications().then((e=>{this.medications=e.data})).catch((()=>{this.$toast.error("Erro ao carregar medicações.")}))},openAddMedDialog(){this.isEditingMed=!1,this.currentMed={id:null,name:"",color:""},this.showMedDialog=!0},editMedication(e){this.isEditingMed=!0,this.currentMed={...e},this.showMedDialog=!0},closeMedDialog(){this.showMedDialog=!1},addMedicationAction(){b.addMedication(this.currentMed).then((()=>{this.$toast.success("Medicação adicionada."),this.loadMedications(),this.closeMedDialog()})).catch((()=>{this.$toast.error("Erro ao adicionar medicação.")}))},updateMedicationAction(){b.updateMedication(this.currentMed.id,this.currentMed).then((()=>{this.$toast.success("Medicação atualizada."),this.loadMedications(),this.closeMedDialog()})).catch((()=>{this.$toast.error("Erro ao atualizar medicação.")}))},deleteMedication(e){confirm("Tem certeza que deseja deletar esta medicação?")&&b.deleteMedication(e).then((()=>{this.$toast.success("Medicação deletada."),this.loadMedications()})).catch((()=>{this.$toast.error("Erro ao deletar medicação.")}))},loadFeverThresholds(){b.getFeverThresholds().then((e=>{this.feverThresholds=e.data})).catch((()=>{this.$toast.error("Erro ao carregar Fever Thresholds.")}))},openAddFTDialog(){this.isEditingFT=!1,this.currentFT={id:null,label:"",min_temp:"",max_temp:"",color:""},this.showFTDialog=!0},editFeverThreshold(e){this.isEditingFT=!0,this.currentFT={...e,min_temp:e.min_temp.toString(),max_temp:e.max_temp.toString()},this.showFTDialog=!0},closeFTDialog(){this.showFTDialog=!1},addFeverThresholdAction(){const e={label:this.currentFT.label,min_temp:parseFloat(this.currentFT.min_temp),max_temp:parseFloat(this.currentFT.max_temp),color:this.currentFT.color};b.addFeverThreshold(e).then((()=>{this.$toast.success("Fever Threshold adicionada."),this.loadFeverThresholds(),this.closeFTDialog()})).catch((e=>{const t=e.response?.data?.error||"Erro ao adicionar Fever Threshold.";this.$toast.error(t)}))},updateFeverThresholdAction(){const e={label:this.currentFT.label,min_temp:parseFloat(this.currentFT.min_temp),max_temp:parseFloat(this.currentFT.max_temp),color:this.currentFT.color};b.updateFeverThreshold(this.currentFT.id,e).then((()=>{this.$toast.success("Fever Threshold atualizada."),this.loadFeverThresholds(),this.closeFTDialog()})).catch((e=>{const t=e.response?.data?.error||"Erro ao atualizar Fever Threshold.";this.$toast.error(t)}))},deleteFeverThreshold(e){confirm("Tem certeza que deseja deletar esta Fever Threshold?")&&b.deleteFeverThreshold(e).then((()=>{this.$toast.success("Fever Threshold deletada."),this.loadFeverThresholds()})).catch((()=>{this.$toast.error("Erro ao deletar Fever Threshold.")}))}}},ae=(0,s.A)(te,[["render",ee],["__scopeId","data-v-dd274668"]]),oe=ae;function le(e,t,a,o,r,d){const s=(0,l.g2)("v-card-title"),i=(0,l.g2)("v-card"),n=(0,l.g2)("v-col"),u=(0,l.g2)("v-row"),m=(0,l.g2)("v-card-text"),h=(0,l.g2)("v-container");return(0,l.uX)(),(0,l.Wv)(h,{class:"py-12"},{default:(0,l.k6)((()=>[(0,l.bF)(u,{justify:"center"},{default:(0,l.k6)((()=>[(0,l.bF)(n,{cols:"12",sm:"8",md:"6"},{default:(0,l.k6)((()=>[(0,l.bF)(i,null,{default:(0,l.k6)((()=>[(0,l.bF)(s,{class:"justify-center"},{default:(0,l.k6)((()=>t[0]||(t[0]=[(0,l.eW)("Escolher Perfil")]))),_:1}),(0,l.bF)(m,null,{default:(0,l.k6)((()=>[(0,l.bF)(u,null,{default:(0,l.k6)((()=>[((0,l.uX)(!0),(0,l.CE)(l.FK,null,(0,l.pI)(r.profiles,(e=>((0,l.uX)(),(0,l.Wv)(n,{key:e.id,cols:"12",sm:"6",md:"4"},{default:(0,l.k6)((()=>[(0,l.bF)(i,{onClick:t=>d.select(e.id),class:"ma-2",outlined:""},{default:(0,l.k6)((()=>[(0,l.bF)(s,{class:"justify-center"},{default:(0,l.k6)((()=>[(0,l.eW)((0,c.v_)(e.name),1)])),_:2},1024)])),_:2},1032,["onClick"])])),_:2},1024)))),128))])),_:1})])),_:1})])),_:1})])),_:1})])),_:1})])),_:1})}const re={name:"SelectProfile",data(){return{profiles:[]}},created(){this.loadProfiles()},methods:{loadProfiles(){b.getProfiles().then((e=>{this.profiles=e.data})).catch((()=>{this.$toast.error("Erro ao carregar perfis.")}))},select(e){localStorage.setItem("currentProfileId",e),this.$router.push("/dashboard/health-fever")}}},de=(0,s.A)(re,[["render",le],["__scopeId","data-v-1120fd1b"]]),se=de,ie=[{path:"/",redirect:"/login"},{path:"/login",name:"Login",component:g},{path:"/dashboard",name:"Dashboard",component:V,children:[{path:"select-profile",component:se},{path:"health-fever",component:O},{path:"health-diseases",component:N},{path:"health-reports",component:J},{path:"management",component:oe}]}],ne=(0,u.aE)({history:(0,u.LA)(),routes:ie});ne.beforeEach(((e,t,a)=>{const o=localStorage.getItem("token");"/login"===e.path||o?a():a("/login")}));const ue=ne;var ce=a(448),me=(a(524),a(221)),he=a(246);a(917);const pe=(0,ce.$N)({icons:{defaultSet:"mdi",aliases:me.z,sets:{mdi:me.r}},theme:{defaultTheme:"light"}}),be={position:he.II.TOP_RIGHT,timeout:5e3};(0,o.Ef)(n).use(ue).use(pe).use(he.Ay,be).mount("#app")}},t={};function a(o){var l=t[o];if(void 0!==l)return l.exports;var r=t[o]={exports:{}};return e[o](r,r.exports,a),r.exports}a.m=e,(()=>{var e=[];a.O=(t,o,l,r)=>{if(!o){var d=1/0;for(u=0;u<e.length;u++){for(var[o,l,r]=e[u],s=!0,i=0;i<o.length;i++)(!1&r||d>=r)&&Object.keys(a.O).every((e=>a.O[e](o[i])))?o.splice(i--,1):(s=!1,r<d&&(d=r));if(s){e.splice(u--,1);var n=l();void 0!==n&&(t=n)}}return t}r=r||0;for(var u=e.length;u>0&&e[u-1][2]>r;u--)e[u]=e[u-1];e[u]=[o,l,r]}})(),(()=>{a.d=(e,t)=>{for(var o in t)a.o(t,o)&&!a.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})}})(),(()=>{a.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()})(),(()=>{a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t)})(),(()=>{a.r=e=>{"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}})(),(()=>{var e={524:0};a.O.j=t=>0===e[t];var t=(t,o)=>{var l,r,[d,s,i]=o,n=0;if(d.some((t=>0!==e[t]))){for(l in s)a.o(s,l)&&(a.m[l]=s[l]);if(i)var u=i(a)}for(t&&t(o);n<d.length;n++)r=d[n],a.o(e,r)&&e[r]&&e[r][0](),e[r]=0;return a.O(u)},o=self["webpackChunkvue_frontend"]=self["webpackChunkvue_frontend"]||[];o.forEach(t.bind(null,0)),o.push=t.bind(null,o.push.bind(o))})();var o=a.O(void 0,[504],(()=>a(358)));o=a.O(o)})();
//# sourceMappingURL=app.25d788f9.js.map