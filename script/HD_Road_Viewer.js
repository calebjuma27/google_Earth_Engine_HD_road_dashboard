
//load geojson data

var showLayer=ee.FeatureCollection(all_data);
var all=showLayer.geometry()

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//max width
var maxx_width=showLayer.aggregate_array("max_width") //extracts column items
var max_max_width=showLayer.aggregate_max("max_width")//max value in max width 
var min_max_width=showLayer.aggregate_min("max_width")//min value in max width 

//min width
var minn_width=showLayer.aggregate_array("min_width") //extracts column items
var max_minn_width=showLayer.aggregate_max("min_width")//max value in min width 
var min_minn_width=showLayer.aggregate_min("min_width")//min value in min width 

//curvature
var average_curv=showLayer.aggregate_array("av_curv") //extracts column items
var max_curv=showLayer.aggregate_max("av_curv")
var min_curv=showLayer.aggregate_min("av_curv")

//get boundary information
var boundary_material= showLayer.aggregate_array('b_material').distinct() //creates a list of distinct items
var boundary_color=showLayer.aggregate_array('b_color').distinct()
var boundary_style=showLayer.aggregate_array('b_style').distinct()

//add "all" to be able to reset the tab to show all features having boundary information
var boundary_material_all=boundary_material.add("all")
var boundary_color_all=boundary_color.add("all")
var boundary_style_all=boundary_style.add("all")


//get lane count
var lane_count= showLayer.aggregate_array('lane_count').distinct().sort() //creates a list of distinct items and sorts in ascending order
//convert the lane counts to string
var changeToString = function(number){
   return ee.String(number)
}
var lane_count_str=lane_count.map(changeToString)
var lane_count_str_all=lane_count_str.add("all") //add all to visualize all the lanes

//create a list for intersection
var road_junction=ee.List(["T-shaped","simple cross_shaped","all data"])
print(road_junction)
//////////////////////////////////////////////////////////////////////////////////////////////////////////

//define UI control panel
var controlPanel = ui.Panel({
    layout: ui.Panel.Layout.flow(), 
    style: {
      stretch: 'horizontal',
      height: '100%',
      width: "300px",
      
    }
});
var mapPanel = ui.Map()
mapPanel.setCenter(13.40099,52.52335, 15)

//to add the whole data when the app is started
var whole_data= mapPanel.addLayer(all,{color:'808080'},'all data').setShown(1)


//define interior panel
var intropanel = ui.Panel([
  ui.Label({
    value: 'Here Maps Data',
    style: {fontSize: '25px', fontWeight: 'bold', color: 'Crimson'}
  }),

]);


//labels to describe the widgets

var label_intersections=ui.Label({
  
    value: 'Road Junctions/Intersections',
    style: {fontSize: '14px', fontWeight: 'bold', color: 'black'}
  } )


var label_lane_count=ui.Label({
  
    value: 'Number of Lanes',
    style: {fontSize: '14px', fontWeight: 'bold', color: 'black'}
  } )

var label_boundary=ui.Label({
  
    value: 'Boundary Information',
    style: {fontSize: '14px', fontWeight: 'bold', color: 'black'}
  } )
  
  
var label_bike_lanes=ui.Label({
  
    value: 'BIke Lanes',
    style: {fontSize: '14px', fontWeight: 'bold', color: 'black'}
  } )
  
  
var label_road_width=ui.Label({
  
    value: 'Road (lane) width',
    style: {fontSize: '14px', fontWeight: 'bold', color: 'black'}
  } )
  
 
var label_max_width=ui.Label({
  
    value: 'Max lane width (cm)',
    style: {fontSize: '12px', fontWeight: 'bold', color: 'black'}
  } ) 
 

var label_min_width=ui.Label({
  
    value: 'Min lane width (cm)',
    style: {fontSize: '12px', fontWeight: 'bold', color: 'black'}
  } ) 

var label_curv=ui.Label({
  
    value: 'curvature',
    style: {fontSize: '14px', fontWeight: 'bold', color: 'black'}
  } ) 


// define drop down window
var laneCountDropdown=ui.Select({
  items:lane_count_str_all.getInfo(),
  placeholder: "select number of Lanes",
  disabled: false,
  
})

var intersectionDropdown=ui.Select({
  items:road_junction.getInfo(),
  placeholder: "select Junction",
  disabled: false,
  
})


var boundaryMaterialDropdown=ui.Select({
  items:boundary_material_all.getInfo(),
  placeholder: "select boundary material",
  disabled: false,
  
})

var boundaryColorDropdown=ui.Select({
  items:boundary_color_all.getInfo(),
  placeholder: "select boundary color",
  disabled: false,
})

var boundaryStyleDropdown=ui.Select({
  items:boundary_style_all.getInfo(),
  placeholder: "select boundary style",
  disabled: false,
})

// checkbox for bike lanes

var checkbox_bikeLanes = ui.Checkbox({
  label:'ONLY roads with Bike Lanes'
});


//button to showcase final result
var button_showResults = ui.Button({
  label:'Show Results',
  style: {color: 'green'},
});


//slider widgets
//max width
var slider_max_width=ui.Slider()
slider_max_width.setMin(0)
slider_max_width.setMax(max_max_width.getInfo())
slider_max_width.setStep(10)
slider_max_width.style({style:{width :'1000px'}})

//min width
var slider_min_width=ui.Slider()
slider_min_width.setMin(0)
slider_min_width.setMax(max_minn_width.getInfo()); 
slider_min_width.setStep(10)
slider_min_width.style({style:{width :'1000px'}})


//curvature insert value
var textboxCurv=ui.Textbox({
  placeholder: "< curv value"})
  
////////////////////////////////////////////////////////////////////////////////////////////////////////////
//function outputs the intersected map
function change_slider(v1,v2,v3,v4,v5,v6,v7,v8,bike_exp){
  
  mapPanel.clear();

 //road lane widths
  var max_road_exp= "max_width "+"< "+ v4;
  var min_road_exp= "min_width "+"> "+ v5;
  //var curv_exp="av_curv < " +v6;//"av_curv" + "< "+  v6;
  
  
  //identify curvatures
  if(v6==="0"){
    var curv_exp="av_curv == " +v6;
  }
  else{
    curv_exp="av_curv < " +v6;}
  
  
  
  //identify lane groups with boundary information
  var b_material_exp="b_material "+"== "+"'"+ v1+"'"
  var b_color_exp="b_color "+"== "+"'"+ v2+"'"
  var b_style_exp="b_style "+"== "+"'"+ v3+"'"
  
  
  if(v1===null || v1=== "all"){
  var b_material_data=showLayer}
  else{
   
    b_material_data=showLayer.filter(b_material_exp)
  }

  var b_material_data_lane_grp=b_material_data.aggregate_array("lane_grp").distinct()
  
  //colour information
  
    if(v2===null || v2=== "all"){
  var b_color_data=showLayer}
  else{
   
    b_color_data=showLayer.filter(b_color_exp)
  }

  var b_color_data_lane_grp=b_color_data.aggregate_array("lane_grp").distinct()
  
  //style information
    
    if(v3===null || v3=== "all"){
  var b_style_data=showLayer}
  else{
   
    b_style_data=showLayer.filter(b_style_exp)
  }

  var b_style_data_lane_grp=b_style_data.aggregate_array("lane_grp").distinct()//
  
  //identify Lane groups with bike lanes
  if(bike_exp===0){
  var bike_data=showLayer}
  else{
    bike_data=showLayer.filter(bike_exp)
  }

  var bike_data_lane_grp=bike_data.aggregate_array("lane_grp").distinct()
  
  
  //number of lanes
  var no_of_lanes_exp= "lane_count"+"=="+v7
  
  if(v7===null || v7=== "all"){
    var no_of_lanes_data=showLayer}
   else{
   
    no_of_lanes_data=showLayer.filter(no_of_lanes_exp)
  }


  var no_of_lanes_data_grp=no_of_lanes_data.aggregate_array("lane_grp").distinct()
  
  //type of intersection
  
  
    if(v8===null || v8=== "all data"){
    var intersection_data=showLayer}
   else if(v8==="simple cross_shaped"){
   var intersection_data=showLayer.filter("start_conn==3 && end_conn>=3 ||end_conn==3 && start_conn>=3");
      }
    else if(v8==="T-shaped"){
      var intersection_data=showLayer.filter("start_conn==2 && end_conn>=2 ||end_conn==2 && start_conn>=2")
      
    }


    var intersection_data_grp=intersection_data.aggregate_array("lane_grp").distinct()
  
 

  var unit=showLayer.filter(ee.Filter.inList("lane_grp",no_of_lanes_data_grp)).filter(ee.Filter.inList("lane_grp",intersection_data_grp)).filter(ee.Filter.inList("lane_grp",bike_data_lane_grp)).filter(ee.Filter.inList("lane_grp",b_material_data_lane_grp)).filter(ee.Filter.inList("lane_grp",b_color_data_lane_grp)).filter(ee.Filter.inList("lane_grp",b_style_data_lane_grp)).filter(curv_exp).filter(max_road_exp).filter(min_road_exp).geometry()
  var intersection=mapPanel.addLayer(unit,{color:'008000'},'selected Result').setShown(1);
  
}
  
///////////////////////////////////////////////////////////////////////////////////////////////////


var showResults=button_showResults.onClick(function(){

     if (checkbox_bikeLanes.getValue()===true ){

      
      var b_material_value=boundaryMaterialDropdown.getValue();
      var b_color_value=boundaryColorDropdown.getValue();
      var b_style_value=boundaryStyleDropdown.getValue();
  
      var max_width_value= slider_max_width.getValue();
      var min_width_value=slider_min_width.getValue();
      //var curv_value=slider_curv.getValue();
      var curv_value=textboxCurv.getValue();
      var no_of_lanes=laneCountDropdown.getValue();
      var intersection_type=intersectionDropdown.getValue()
      var bike_exp="lane_type =='BICYCLE'";
      var curv_text_value=textboxCurv.getValue()
      var intersected_values=change_slider(b_material_value,b_color_value,b_style_value,max_width_value,min_width_value,curv_value,no_of_lanes,intersection_type,bike_exp)
   
     } 
     else if ((checkbox_bikeLanes.getValue()===false )){
     
     b_material_value=boundaryMaterialDropdown.getValue();
      b_color_value=boundaryColorDropdown.getValue();
      b_style_value=boundaryStyleDropdown.getValue();

      max_width_value= slider_max_width.getValue();
      min_width_value=slider_min_width.getValue();
      //curv_value=slider_curv.getValue();
      curv_value=textboxCurv.getValue();
      no_of_lanes=laneCountDropdown.getValue();
      intersection_type=intersectionDropdown.getValue();
      bike_exp=0//"lane_type !='BICYCLE'";
      
      intersected_values=change_slider(b_material_value,b_color_value,b_style_value,max_width_value,min_width_value,curv_value,no_of_lanes,intersection_type,bike_exp)
     }

})

//---------------- Composition  ----------------------------------------------------------------
///////////////////////////////////////////////////////////////////////////////////////////////////

ui.root.clear();  // to get rid of default ui Map Widget
ui.root.add(controlPanel);
ui.root.add(mapPanel);

controlPanel.add(intropanel);

controlPanel.add(label_lane_count);
controlPanel.add(laneCountDropdown);

controlPanel.add(label_intersections);
controlPanel.add(intersectionDropdown)

controlPanel.add(label_boundary);
controlPanel.add(boundaryMaterialDropdown);
controlPanel.add(boundaryColorDropdown);
controlPanel.add(boundaryStyleDropdown);

controlPanel.add(label_bike_lanes);
controlPanel.add(checkbox_bikeLanes);

controlPanel.add(label_curv);
controlPanel.add(textboxCurv)



controlPanel.add(label_road_width);
controlPanel.add(label_max_width);
controlPanel.add(slider_max_width);

controlPanel.add(label_min_width);
controlPanel.add(slider_min_width);

controlPanel.add(button_showResults);

