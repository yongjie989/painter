/*
Author: Ethan Huang
Email: yongjie989@gmail.com

- 1 pixel = 0.026cm
- 1 cm = 37.79 pixels
- 4 x 6 inch, typical display for computer screen is 72dpi,
  so, 4x6" is 4" x 72dpi = 288pixels; 6" x 72dpi = 432pixels.
  But sometime we want a much better resolution as printer. So typical suggest to 300dpi.
  So 4x6" is 4" x 300dpi = 1200pixels; 6" x 300dpi = 1800pixels.
- 300/72=4.17; When before output image we need to change canvas size:
  step 1 : modify width and height for the canvas using setHeight(canvas.getHeight() * 4.17)
  step 2 : modify width and height size, top and left position for each objects:
  var o = canvas.getObjects();
  o[index].scaleX *= 4.17;
  o[index].scaleY *= 4.17;
  o[index].top *= 4.17;
  o[index].left *= 4.17;
  ...
  canvas.toDataURL('png');
  
* 2013-09-11
  - database location at C:\Documents and Settings\THIS_USER\Local Settings\Application Data\Google\Chrome\User Data\Default\databases\file_***\ HERE!!
  - o.set({opacity:0, selectable: false}) and o.set({opacity:1, selectable: true})
  
	"mouse:down"
	"mouse:move"
	"mouse:up"

	"after:render"
	"before:selection:cleared"
	"selection:created"
	"selection:cleared"

	"object:modified"
	"object:selected"
	"object:moving"
	"object:scaling"
	"object:rotating"
	"object:added"
	"object:removed"
	
	[Get work list] When load in painter page.
	HandlerPainter.ashx?action=get_work_list&order_id=xx
	
	[Completed] When user click Completed button then send the action.
	HandlerPainter.ashx?action=finish_painter&order_detail_id=xx&painter_id=123456
	
	
* 2013-09-12
  - After changed the bring to forward and front position for object, here have detect here will change index position in canvas._objects at the same time.
    So, might create a new field called "layer_index" in table, and write index when add a new object.

*/

var active_object;
var newImage;
var active_font;
var display_min_width = 500;
var display_min_height = 450;
var display_width = document.width - display_min_width;
var display_height = document.height - display_min_height;

var canvas = new fabric.Canvas('c');
canvas.setWidth(display_width);
canvas.setHeight(display_height);
$("#mycanvas_base").css({'width':display_width,'height':display_height});
$("#separate_line").css({'width':display_width/2,'height':display_height});
document.onselectstart = function () { return false; };

function disableF5(e) {
    if ((e.which || e.keyCode) == 116)
        e.preventDefault();
};
$(document).bind("keydown", disableF5);

function deleteKey(e){
	if ((e.which || e.keyCode) == 46)
		delete_object();
};
$(document).bind("keydown", deleteKey);
function change_page(page) {
    $("#photos_page").hide();
    $("#text_page").hide();
    $("#material_page").hide();
    $("#mask_page").hide();
    $("#background_page").hide();
    $(page).show();


};

function setStorage(name, value, expires) {
    var date = new Date();
    var schedule = Math.round((date.setSeconds(date.getSeconds()+expires))/1000);
    localStorage.setItem(name, value);
    localStorage.setItem(name+'_time', schedule);
}

function getStorage(name){
	return localStorage.getItem(name);
}

function clearUserName() {
    localStorage.user_name = '';
    localStorage.before_login_url = '';
    return false;
}


$(document).ready(function () {
    var activate_detail;
	/*
    $("#NewPage").click(function () {
        activate_detail = $("#NewPage_Detail");
        activate_detail.show();
        $("#toolbar_setup_panel").slideDown();

    });
    $("#close_toolbar_setup_panel_btn").click(function () {
        activate_detail.hide();
        $("#toolbar_setup_panel").slideUp();
    });
	*/


    $('#fontSelect').fontSelector({
        'hide_fallbacks': true,
        'initial': 'Courier New,Courier New,Courier,monospace',
        'selected': function (style) {
            active_font = style;
            console.log(style);
        },
        'fonts': [
			'王漢宗新潮體,王漢宗新潮體',
            '王漢宗特明體,王漢宗特明體',
            '王漢宗波卡體,王漢宗波卡體',
            '王漢宗中隸書,王漢宗中隸書',
            '王漢宗中仿宋,王漢宗中仿宋',
            '王漢宗空疊圓,王漢宗空疊圓',
            '王漢宗勘亭流,王漢宗勘亭流',
            '王漢宗酷正海報,王漢宗酷正海報',
            '標楷體,標楷體',
            '新細明體,細明體',
            '微軟正黑體,微軟正黑體',
            'Flavors,Flavors',
            'UnifrakturMaguntia,UnifrakturMaguntia',
            'Hanalei,Hanalei',
            'Pinyon Script,Pinyon Script',
            'Arial,Arial,Helvetica,sans-serif',
            'Arial Black,Arial Black,Gadget,sans-serif',
            'Comic Sans MS,Comic Sans MS,cursive',
            'Courier New,Courier New,Courier,monospace',
            'Georgia,Georgia,serif',
            'Impact,Charcoal,sans-serif',
            'Lucida Console,Monaco,monospace',
            'Lucida Sans Unicode,Lucida Grande,sans-serif',
            'Palatino Linotype,Book Antiqua,Palatino,serif',
            'Tahoma,Geneva,sans-serif',
            'Times New Roman,Times,serif',
            'Trebuchet MS,Helvetica,sans-serif',
            'Verdana,Geneva,sans-serif',
            'Gill Sans,Geneva,sans-serif'
            ]
    });
});

function delete_object() {
	var o = canvas.getActiveObject();
	isdelete = true;
	record_step("刪除物件");

	//update database
	db.transaction(function(tx){
		var sql = 'update history set isdelete="Y" where painter_id="'+painter_id+'" and object_index="'+o.id+'"; ';
		console.log(sql);
		tx.executeSql(sql, [], function(tx, results){
		});
	});
	
	
    //canvas.remove(o);
	o.visible = false;
	canvas.renderAll();
	close_right_menu();
	$("#layer_list").find("div[id='layer_id_"+o.id+"']").hide();	

};

function add_text() {
	var date = new Date();
	var id = date.getTime();
    var mytext = $("#add_text").val();
    var fontsize = $("#fontsize").val();
    var new_text = new fabric.Text(mytext, {
		id: id,
        fontFamily: active_font,
        fontSize: parseInt(fontsize),
        left: 100,
        top: 100,
		output_pass: false,
		always_on_top: false
    });
    canvas.add(new_text);
	var o = canvas.getObjects();
	canvas.setActiveObject(o[o.length-1]);
	
	isnewfont = true;
	record_step('initial font');
	record_step('新增文字');
	add_layer();
	return false;
};

function enlarge_object() {
    var o = canvas.getActiveObject();
    if (o.type == 'text') {
        var new_fontSize = o.get('fontSize') * 1.2;
        o.set('fontSize', new_fontSize);
        o.adjustPosition();
        canvas.renderAll();
        return false;
    };
    var new_width = o.getWidth() * 1.2;
    var new_height = o.getHeight() * 1.2;

    o.scaleX = 1.0;
    o.scaleY = 1.0;

    o.set({ width: new_width, height: new_height });
    o.adjustPosition();
    canvas.renderAll();
};
function decrease_object() {
    var o = canvas.getActiveObject();
    if (o.type == 'text') {
        var new_fontSize = o.get('fontSize') * 0.8;
        o.set('fontSize', new_fontSize);
        o.adjustPosition();
        canvas.renderAll();
        return false;
    };

    console.log('width:' + o.getWidth());
    var new_width = o.getWidth() * 0.8;
    var new_height = o.getHeight() * 0.8;
    console.log('width:' + new_width);

    o.scaleX = 1.0;
    o.scaleY = 1.0;

    o.set({ width: new_width, height: new_height });
    o.adjustPosition();
    canvas.renderAll();
};
/*
canvas.getObjects();
canvas.getObjects()[2];
canvas.getActiveObject();選取中的物件.

//取得圖片檔名
var ac = canvas.getActiveObject();
ac._originalImage.attributes.src.value;

//刪除選擇的物件
canvas.remove( canvas.getActiveObject() )

//移到最後層
canvas.sendToBack ( canvas.getActiveObject() )
//移到下一層
canvas.sendBackwards( canvas.getActiveObject() )
//移到上一層
canvas.bringToFront( canvas.getActiveObject() )
//移到最上層
canvas.bringForward( canvas.getActiveObject() )

//重新校正位置
//o.adjustPosition()

//取得圖片原本的大小
o.getOriginalSize().width
o.getOriginalSize().height

//修改字體
var o = canvas.getActiveObject()
o.set('fontFamily', '王漢宗特明體')
canvas.renderAll()

//Trigger Active Object
var o = canvas.getObjects()
canvas.setActiveObject(o[index])
選擇新加入的object
canvas.setActiveObject(o[o.length-1])

//背景
canvas.setBackgroundImage('painter/background/1.jpg', function(){ canvas.renderAll();})

*/

var real_output_area = new fabric.Rect({
  left: canvas.getWidth() / 2,
  top: canvas.getHeight() / 2,
  fill: 'none',
  width: canvas.getWidth() - 12,
  height: canvas.getHeight() - 12,
  strokeWidth: 1,
  selectable: false,
  strokeDashArray: [2, 2],
  stroke: '#0000FF',
  id: 'real_output_area',
  output_pass: true,
  always_on_top: true,
});
canvas.add(real_output_area);

var middle_line = new fabric.Line([canvas.getWidth() / 2,0,canvas.getWidth() / 2,canvas.getHeight()], {
    fill: 'red',
    stroke: 'red',
    strokeWidth: 1,
    selectable: false,
	strokeDashArray: [2, 2],
	id: 'middle_line',
	output_pass: true,
	always_on_top: true
  });
canvas.add(middle_line);
/*
var circle = new fabric.Circle({
    radius: 20, fill: 'green', left: 100, top: 100, angle: 45, id : canvas.getObjects().length
});
canvas.add(circle);

var triangle = new fabric.Triangle({
    width: 20, height: 30, fill: 'blue', left: 50, top: 50, id : canvas.getObjects().length
});
canvas.add(triangle);
*/

function handleDragStart(e) {
    [ ].forEach.call(images, function (img) {
        img.classList.remove('img_dragging');
    });
    this.classList.add('img_dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }

    e.dataTransfer.dropEffect = 'copy';
    return false;
}

function handleDragEnter(e) {
    this.classList.add('over');
}

function handleDragLeave(e) {
    this.classList.remove('over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    var img = document.querySelector('.support_drag img.img_dragging');
	//console.log(img.src);
    //console.log('event: ', e);
	var date = new Date();
	var id = date.getTime();
	past_width = img.width;
	past_height = img.height;
	past_top = img.top;
	past_left = img.left;
	past_scaleX = 1;
	past_scaleY = 1;
    newImage = new fabric.Image(img, {
		id: id,
        width: img.width,
        height: img.height,
        left: e.layerX,
        top: e.layerY,
		filename: img.src,
		has_effect_for_mask: false,
		clipName: id,
		output_pass: false,
		always_on_top: false
    });
    canvas.add(newImage);
	var o = canvas.getObjects();
	canvas.setActiveObject(o[o.length-1]);
	isnewobject = true;
	record_step('initial');
	record_step('新增物件');
	add_layer();
	
	update_property_block();
	adjust_layer();
    return false;
}

function handleDragEnd(e) {
    [ ].forEach.call(images, function (img) {
        img.classList.remove('img_dragging');
    });
}

if (Modernizr.draganddrop) {
    var images = document.querySelectorAll('.support_drag img');
    [ ].forEach.call(images, function (img) {
        img.addEventListener('dragstart', handleDragStart, false);
        img.addEventListener('dragend', handleDragEnd, false);
    });
    var canvasContainer = document.getElementById('mycanvas_base');
    canvasContainer.addEventListener('dragenter', handleDragEnter, false);
    canvasContainer.addEventListener('dragover', handleDragOver, false);
    canvasContainer.addEventListener('dragleave', handleDragLeave, false);
    canvasContainer.addEventListener('drop', handleDrop, false);
} else {
    alert("This browser doesn't support the HTML5 Drag and Drop API.");
};

function move_background_apply_btn(o, img) {
    console.log(img);
    $("#apply_background_btn").css({
        'position': 'relative',
        'border': '1px solid #000000',
        'padding': '3px',
        'background-color': '#f2f2f2',
        'cursor': 'pointer',
        'top': o.top - 160,
        'left': o.left + 90
    }).click(function () {
        canvas.setBackgroundImage(img, function () { canvas.renderAll(); })
    });
};


function show_init_box() {
    var c = url.parse(location.search);
    console.log(c);
    var category = c.get.category;
    $("#init_inner_box").load("product.aspx?category=" + category);
};

function checkout(){
    $.getJSON('HandlerCheckOut.ashx?action=insert_item&user_name=a&category=寫真書&prod_id=9', function(data){
        if(data){
            if(data.id == '000'){
                window.location.href = 'checkout.aspx?user_name=a&category=寫真書&prod_id=9&make_type=painter';
            };
        };
    });
};

function preview(){
	$("#preview_block").show();
	var preview_image = document.getElementById("preview_image");
	preview_image.src = canvas.toDataURL('png');
	
};

function show_right_menu(x,y){
	close_right_menu();
	open_right_menu();
	$("#right_menu").css({"left":x+"px","top":y+"px"});
	
};

var cnv = document.getElementById('mycanvas_base');
cnv.oncontextmenu = function(env) {
	console.log(env);
	var x = env.offsetX;
	var y = env.offsetY;
	//console.log(x+ '     ' + y);
	$.each(canvas._objects, function(k,v){
		// k>0, because we do not need choice "cut_area"
		if(k>0){
			if( (x >= v.left - v.width/2) && (x <= v.left + v.width/2) ){
				if( (y >= v.top - v.height/2) && (y <= v.top + v.height/2) ){
					//Why need check K > 0, because k = 0 is "Bleed".
					if(k>0){
						canvas.setActiveObject( canvas._objects[k] );
						show_right_menu(env.pageX,env.pageY);
						//console.log(v);
						return false; 
					}
				};
			};
			close_right_menu();
		};			
	});
	return false; 
};

function open_right_menu(){
	$("#right_menu").show();
};
function close_right_menu(){
	$("#right_menu").hide();
};

function bring_forward(){
	canvas.bringForward( canvas.getActiveObject() );
	close_right_menu();
	record_step('移到上一層');
	exchange_layer('bring_forward');
};

function object_infront(){
	canvas.bringToFront( canvas.getActiveObject() );
	close_right_menu();
	record_step('移到最上層');
};

function bring_backward(){
	canvas.sendToBack ( canvas.getActiveObject() );
	close_right_menu();
	record_step('移到最下層');
};

function object_behind(){
	canvas.sendBackwards( canvas.getActiveObject() );
	close_right_menu();
	record_step('移到下一層');
	console.log(this);
	exchange_layer('object_behind');
};
function exchange_layer(behavior){
	var o = canvas.getActiveObject();
	if (behavior == 'bring_forward'){
		$("#layer_list").find("div[id='layer_id_"+o.id+"']").insertBefore( $("#layer_list").find("div[id='layer_id_"+o.id+"']").prev("div") )
	}
	if (behavior == 'object_behind'){
		$("#layer_list").find("div[id='layer_id_"+o.id+"']").insertAfter( $("#layer_list").find("div[id='layer_id_"+o.id+"']").next("div") )
	}
};

var db = open_database();
create_database();
var painter_id;
var session_name = getStorage('user_name');
var order_id = get_order_id();
var order_detail_id;
var ismoving = false;
var isscaling = false;
var isrotating = false;
var isnewobject = false;
var isnewfont = false;
var isdelete = false;
get_painter_id();

var undo_id;
var redo_id;
var min_step_id;
var last_step_id;

var past_width;
var past_height;
var past_top;
var past_left;
var past_scaleX;
var past_scaleY;

function get_order_id(){
	var c = url.parse(location.search);
    var order_id = c.get.order_id;
	return order_id;
};

function open_database(){
	var db = openDatabase('painter','1.0','painter database', 1024 * 20);
	return db;
};

function create_database(){
	db.transaction(function(d){
		d.executeSql('create table IF NOT EXISTS history(id INTEGER PRIMARY KEY AUTOINCREMENT,painter_id integer,user_name text,layer_index integer, object_index integer, type text,top real,left real,width real,height real,selectable text,opacity real,scaleX real,scaleY real,fill text,radius real,angle real,stroke text,strokeWidth real,strokeDashArray text,filename text,action_function text,step_name text, isdelete text);');
	});
	db.transaction(function(d){
		d.executeSql("create table IF NOT EXISTS painter_manage(id INTEGER ,user_name text,createtime DATETIME DEFAULT (datetime('now','localtime')));");
	});

};

function get_painter_id(){
	var date = new Date();
	db.transaction(function(d){
		d.executeSql('insert into painter_manage (id, user_name) values ("'+date.getTime()+'", "'+session_name+'");');
	});
	db.transaction(function(d){
		d.executeSql('select max(id) as last_id from painter_manage where user_name ="'+session_name+'";', [], function(tx, results){
		painter_id = results.rows.item(0).last_id;
		});
	});
};

function record_step(step_name){
	var o = canvas.getActiveObject();
	if (o.type == "image")
		filename = o._originalImage.attributes.src.value;
	else
		filename = "";
	var action_function = record_step.caller.name;
	if(ismoving == true)
		action_function = 'moving';
	if(isscaling == true)
		action_function = 'scaling';
	if(isrotating == true)
		action_function = 'rotating';
	if(isnewobject == true)
		action_function = 'new object';
	if(isnewfont == true)
		action_function = 'new font';
	if(isdelete == true)
		action_function = 'delete object';
	
	if(step_name == 'initial')
		action_function = 'initial object';
	if(step_name == 'initial font')
		action_function = 'initial font';	
    
    //var layer_index = canvas._objects.length-1;
    for(var i=0;i<canvas._objects.length;i++){
        //console.log('canvas._objects[i].id = ' + canvas._objects[i].id + '   ' + 'o.id = ' + o.id);
        if(canvas._objects[i].id == o.id){
            var layer_index = i;
            break;
        }
    }
	
	var pw = past_width;
	console.log('pw = ' + pw);
	console.log('past_width = ' + past_width);
	console.log('o.width = ' + o.width);
	var ph = past_height;
	var pt = past_top;
	var pl = past_left;
	var sx = past_scaleX;
	var sy = past_scaleY;
	
	if (pw == undefined)
		pw = o.width;
	if (ph == undefined)
		ph = o.height;
	if (pt == undefined)
		pt = o.top;
	if (pl == undefined)
		pl = o.left;
	if (sx != o.scaleX)
		sx = o.scaleX;
	if (sy != o.scaleY)
		sy = o.scaleY;
		
	console.log('pw = ' + pw);

	/*	
	var sql = 'insert into history (painter_id, user_name, layer_index, object_index, type, top, left, width, height, '+
	'selectable, opacity, scaleX, scaleY, fill, radius, angle, stroke, strokeWidth, strokeDashArray, filename, action_function, step_name,isdelete)'+
	' values ("'+painter_id+'","'+session_name+'","'+layer_index+'","'+o.id+'","'+o.type+'","'+pt+'","'+pl+'","'+pw+'","'+ph+'", '+
	' "'+o.selectable+'","'+o.opacity+'", "'+sx+'", "'+sy+'", "'+o.fill+'", "'+o.radius+'", "'+o.angle+'", "'+o.stroke+'", '+
	' "'+o.strokeWidth+'", "'+o.strokeDashArray+'", "'+filename+'", "'+action_function+'", "'+step_name+'","N" )';
	*/
	var sql = 'insert into history (painter_id, user_name, layer_index, object_index, type, top, left, width, height, '+
	'selectable, opacity, scaleX, scaleY, fill, radius, angle, stroke, strokeWidth, strokeDashArray, filename, action_function, step_name,isdelete)'+
	' values ("'+painter_id+'","'+session_name+'","'+layer_index+'","'+o.id+'","'+o.type+'","'+o.top+'","'+o.left+'","'+o.width+'","'+o.height+'", '+
	' "'+o.selectable+'","'+o.opacity+'", "'+o.scaleX+'", "'+o.scaleY+'", "'+o.fill+'", "'+o.radius+'", "'+o.angle+'", "'+o.stroke+'", '+
	' "'+o.strokeWidth+'", "'+o.strokeDashArray+'", "'+filename+'", "'+action_function+'", "'+step_name+'","N" )';

	db.transaction(function(d){
		d.executeSql(sql);
	});
};

canvas.on('object:moving', function(options) {
	if (options.target) {
		ismoving = true;
	}
});
canvas.on('object:scaling', function(options) {
	if (options.target) {
		isscaling = true;
	}
});
canvas.on('object:rotating', function(options) {
	if (options.target) {
		isrotating = true;
	}
});
canvas.on('mouse:up', function(options) {
	close_right_menu();
	isnewobject = false;
	isnewfont = false;
	isdelete = false;
	console.log('mouse:up');
	if (options.target && ismoving == true) {
		record_step('移動');
		//undo_id = undefined;
		//redo_id = undefined;
//		console.log(options.target);
	}
	if (options.target && isscaling == true) {
		record_step('調整大小');
	}
	if (options.target && isrotating == true) {
		record_step('旋轉');
	}
	
	update_property_block();
	
	undo_id = undefined;
	redo_id = undefined;
	ismoving = false;
	isscaling = false;
	isrotating = false;

});

canvas.on('mouse:down', function(options) {
	console.log('mouse:down');
	past_width = options.target.width;
	past_height = options.target.height;
	past_top = options.target.top;
	past_left = options.target.left;
	past_scalX = options.target.scaleX;
	past_scalY = options.target.scaleY;
	//console.log(options.target);
});
function update_property_block(){
	var o = canvas.getActiveObject();
	if(o) {
		$("#property_width").val(o.width.toFixed(2));
		$("#property_height").val(o.height.toFixed(2));
		$("#property_left").val(o.left.toFixed(2));
		$("#property_top").val(o.top.toFixed(2));
	}
};

function get_min_step_id(callback){
db.transaction(function(tx){
	var sql = 'select min(id) as min_id from history where painter_id="'+painter_id+'"; '; //and isdelete="N"
	tx.executeSql(sql, [], function(tx, results){
	if(results.rows.length>0){
		//results.rows.item(0);
		//console.log('[*]min_step_id = ' + results.rows.item(0).min_id);
		callback(results.rows.item(0));
	}
	});
});
};

function get_last_step_id(callback){
db.transaction(function(tx){
	var sql = 'select max(id),* from history where painter_id="'+painter_id+'" '; //and isdelete="N"
	tx.executeSql(sql, [], function(tx, results){
	if(results.rows.length>0){
		//results.rows.item(0);
		callback(results.rows.item(0));
	}
	});
});
};
	
function undo(){
	get_min_step_id(function(callback){
		min_step_id = callback.min_id;
		console.log('[0]min_step_id = ' + min_step_id);
	});
	
	get_last_step_id(function(callback){
		last_step_id = callback.id;
		console.log('[1]last_step_id = ' + last_step_id);
		
		if (undo_id == undefined)
			undo_id = last_step_id;
		
		db.transaction(function(d){

			if (undo_id > min_step_id)
				undo_id--;
			console.log('undo_id = ' + undo_id);

			console.log('select * from history where painter_id="'+painter_id+'" and id="'+undo_id+'" ; ');
			d.executeSql('select * from history where painter_id="'+painter_id+'" and id="'+undo_id+'" ; ', [], function(tx, results){
				if(results.rows.length > 0){
					var o = results.rows.item(0);
					if(o.action_function == 'moving')
						undo_move(o);
					if(o.action_function == 'scaling')
						undo_scale(o);
					if(o.action_function == 'rotating')
						undo_rotate(o);
					if(o.action_function == 'initial object')
						undo_handleDrop(o);
					if(o.action_function == 'new object')
						undo_new_object(o);
					if(o.action_function == 'delete object')
						undo_delete_object(o);
					if(o.action_function == 'new font')
						undo_new_font(o);
					if(o.action_function == 'initial font')	
						undo_add_font(o);
					if(o.action_function == 'object_behind')
						undo_object_behind(o);
					if(o.action_function == 'bring_forward')
						undo_bring_forward(o);
						
						
				}
			});
			
		});
		
		return true;
	});
	redo_id = undefined;
	
};
function redo(){
	if (redo_id == undefined){
		redo_id = undo_id+1;
	}else{
		if (redo_id < last_step_id)
			redo_id++;
	}
	run_redo(redo_id);
	undo_id = undefined;
};
/*
function undo(){
	db.transaction(function(d){
		if (undo_id == undefined)
			var sql = 'select max(id),* from history where painter_id="'+painter_id+'"; ';
		else
			var sql = 'select * from history where painter_id="'+painter_id+'" and id="'+undo_id+'"; ';
		d.executeSql(sql, [], function(tx, results){
			if(results.rows.length>0){
				get_undo_result(results.rows.item(0));
			}
		});
	});
};
*/
/*
function redo(){
	undo_id = undefined;
	if (redo_id == undefined)
		redo_id = undo_id+1;
	else
		redo_id++;
	direct_move(redo_id);

};
*/

function undo_move(o){
	//console.log('trigger undo_move');
	var next_o = canvas.getObjects();
	for(var i=0; i<= next_o.length-1; i++){
		if (next_o[i].id == o.object_index){
			canvas.setActiveObject( next_o[i] );
			next_o[i].set({top:o.top, left:o.left, width:o.width, height:o.height, scaleX:o.scaleX, scaleY:o.scaleY, angle:o.angle});
			next_o[i].adjustPosition();
			canvas.renderAll();
			break;
		};
	}; 
};
function undo_scale(o){
	var next_o = canvas.getObjects();
	for(var i=0; i<= next_o.length-1; i++){
		if (next_o[i].id == o.object_index){
			canvas.setActiveObject( next_o[i] );
			next_o[i].set({top:o.top, left:o.left, width:o.width, height:o.height, scaleX:o.scaleX, scaleY:o.scaleY, angle:o.angle});
			next_o[i].adjustPosition();
			canvas.renderAll();
			break;
		};
	}; 
};

function undo_rotate(o){
	var next_o = canvas.getObjects();
	for(var i=0; i<= next_o.length-1; i++){
		if (next_o[i].id == o.object_index){
			canvas.setActiveObject( next_o[i] );
			next_o[i].set({top:o.top, left:o.left, width:o.width, height:o.height, scaleX:o.scaleX, scaleY:o.scaleY, angle:o.angle});
			next_o[i].adjustPosition();
			canvas.renderAll();
			break;
		};
	}; 
};

function undo_new_object(o){
	var next_o = canvas.getObjects();
	for(var i=0; i<= next_o.length-1; i++){
		if (next_o[i].id == o.object_index){
			canvas.setActiveObject( next_o[i] );
			next_o[i].set({top:o.top, left:o.left, width:o.width, height:o.height, scaleX:o.scaleX, scaleY:o.scaleY, angle:o.angle});
			next_o[i].adjustPosition();
			canvas.renderAll();
			break;
		};
	}; 
};


function undo_handleDrop(o){
	if(confirm('確定刪除物件?刪除後將無法復原.')){
		db.transaction(function(tx){
			var sql = 'update history set isdelete="Y" where painter_id="'+painter_id+'" and object_index="'+o.object_index+'"; ';
			console.log(sql);
			tx.executeSql(sql, [], function(tx, results){
			});
		});
		
		var next_o = canvas.getObjects();
		for(var i=0; i<= next_o.length-1; i++){
			if (next_o[i].id == o.object_index){
				canvas.setActiveObject( next_o[i] );
				next_o[i].visible = false;
				canvas.renderAll();
				break;
			};
		}; 
		//var remove_layer_index = (next_o.length-1);
		//$("#layer_list > div:eq("+remove_layer_index+")").hide();
		$("#layer_list").find("div[id='layer_id_"+o.object_index+"']").hide();
	}
};


function undo_delete_object(o){
	db.transaction(function(tx){
		var sql = 'update history set isdelete="N" where painter_id="'+painter_id+'" and object_index="'+o.object_index+'"; ';
		console.log(sql);
		tx.executeSql(sql, [], function(tx, results){
		});
	});
	
	var next_o = canvas.getObjects();
	for(var i=0; i<= next_o.length-1; i++){
		if (next_o[i].id == o.object_index){
			canvas.setActiveObject( next_o[i] );
			next_o[i].visible = true;
			canvas.renderAll();
			break;
		};
	}; 
	//var remove_layer_index = (next_o.length-1);
	//$("#layer_list > div:eq("+remove_layer_index+")").show();
	$("#layer_list").find("div[id='layer_id_"+o.object_index+"']").show();
};
function undo_new_font(o){
	var next_o = canvas.getObjects();
	for(var i=0; i<= next_o.length-1; i++){
		if (next_o[i].id == o.object_index){
			canvas.setActiveObject( next_o[i] );
			next_o[i].set({top:o.top, left:o.left, width:o.width, height:o.height, scaleX:o.scaleX, scaleY:o.scaleY, angle:o.angle});
			next_o[i].adjustPosition();
			canvas.renderAll();
			break;
		};
	}; 
};

function undo_add_font(o){
	db.transaction(function(tx){
		var sql = 'update history set isdelete="Y" where painter_id="'+painter_id+'" and object_index="'+o.object_index+'"; ';
		console.log(sql);
		tx.executeSql(sql, [], function(tx, results){
		});
	});
	
	var next_o = canvas.getObjects();
	for(var i=0; i<= next_o.length-1; i++){
		if (next_o[i].id == o.object_index){
			canvas.setActiveObject( next_o[i] );
			next_o[i].visible = false;
			canvas.renderAll();
			break;
		};
	}; 
	//var remove_layer_index = (next_o.length-1);
	//$("#layer_list > div:eq("+remove_layer_index+")").hide();
	$("#layer_list").find("div[id='layer_id_"+o.object_index+"']").hide();
};

function undo_object_behind(o){
	var next_o = canvas.getObjects();
	for(var i=0; i<= next_o.length-1; i++){
		if (next_o[i].id == o.object_index){
			canvas.setActiveObject( next_o[i] );
			canvas.bringForward( next_o[i] );
			break;
		};
	}; 
};
function undo_bring_forward(o){
	var next_o = canvas.getObjects();
	for(var i=0; i<= next_o.length-1; i++){
		if (next_o[i].id == o.object_index){
			canvas.setActiveObject( next_o[i] );
			canvas.sendBackwards( next_o[i] );
			break;
		};
	}; 
};


function redo_move(o){
	//console.log('trigger redo_move');
	var next_o = canvas.getObjects();
	for(var i=0; i<= next_o.length-1; i++){
		if (next_o[i].id == o.object_index){
			canvas.setActiveObject( next_o[i] );
			next_o[i].set({top:o.top, left:o.left, width:o.width, height:o.height, scaleX:o.scaleX, scaleY:o.scaleY, angle:o.angle});
			next_o[i].adjustPosition();
			canvas.renderAll();
			break;
		};
	}; 
};
function redo_scale(o){
	var next_o = canvas.getObjects();
	for(var i=0; i<= next_o.length-1; i++){
		if (next_o[i].id == o.object_index){
			canvas.setActiveObject( next_o[i] );
			next_o[i].set({top:o.top, left:o.left, width:o.width, height:o.height, scaleX:o.scaleX, scaleY:o.scaleY, angle:o.angle});
			next_o[i].adjustPosition();
			canvas.renderAll();
			break;
		};
	}; 
};
function redo_rotate(o){
	var next_o = canvas.getObjects();
	for(var i=0; i<= next_o.length-1; i++){
		if (next_o[i].id == o.object_index){
			canvas.setActiveObject( next_o[i] );
			next_o[i].set({top:o.top, left:o.left, width:o.width, height:o.height, scaleX:o.scaleX, scaleY:o.scaleY, angle:o.angle});
			next_o[i].adjustPosition();
			canvas.renderAll();
			break;
		};
	}; 
};
function redo_object_behind(o){
	var next_o = canvas.getObjects();
	for(var i=0; i<= next_o.length-1; i++){
		if (next_o[i].id == o.object_index){
			canvas.setActiveObject( next_o[i] );
			canvas.sendBackwards( next_o[i] );
			break;
		};
	}; 
};
function redo_bring_forward(o){
	var next_o = canvas.getObjects();
	for(var i=0; i<= next_o.length-1; i++){
		if (next_o[i].id == o.object_index){
			canvas.setActiveObject( next_o[i] );
			canvas.bringForward( next_o[i] );
			break;
		};
	}; 
};

function run_redo(id){
	db.transaction(function(d){
	var sql = 'select * from history where painter_id="'+painter_id+'" and id="'+id+'"; ';
	console.log(sql);
	d.executeSql(sql, [], function(tx, results){
		if(results.rows.length>0){
			var o = results.rows.item(0);
			if(o.action_function == 'moving')
				redo_move(o);
			if(o.action_function == 'scaling')
				redo_scale(o);
			if(o.action_function == 'rotating')
				redo_rotate(o);
			if(o.action_function == 'object_behind')
				redo_object_behind(o);
			if(o.action_function == 'bring_forward')
				redo_bring_forward(o);
			if(o.action_function == 'delete object')
				delete_object();
		}
	});
	});
};

/*
function direct_move(id){
	db.transaction(function(d){
	var sql = 'select * from history where painter_id="'+painter_id+'" and id="'+id+'"; ';
	d.executeSql(sql, [], function(tx, results){
		if(results.rows.length>0){
			var o = results.rows.item(0);
			var next_o = canvas.getActiveObject();
			next_o.set({top:o.top, left:o.left});
			next_o.adjustPosition();
			canvas.renderAll();
		}
	});
	});
};
*/
function get_undo_result(data){
	if(data.id != undefined){
		db.transaction(function(d){
			undo_id = (data.id)-1;
			console.log('undo_id = ' + undo_id);
			d.executeSql('select * from history where painter_id="'+painter_id+'" and id="'+undo_id+'"; ', [], function(tx, results){
				if(results.rows.length > 0){
					var o = results.rows.item(0);
					if(o.action_function == 'moving')
						undo_move(o);
				}
			});
		});
	}
};

function get_redo_result(data){
	if(data.id != undefined){
		db.transaction(function(d){
			redo_id = (data.id)+1;
			console.log('redo_id = ' + redo_id);
			d.executeSql('select * from history where painter_id="'+painter_id+'" and id="'+redo_id+'"; ', [], function(tx, results){
				if(results.rows.length > 0){
					var o = results.rows.item(0);
					if(o.action_function == 'moving')
						redo_move(o);
				}
			});
		});
	}
};

function adjust_layer() {
	var next_o = canvas.getObjects();
	for(var i=0; i<= next_o.length-1; i++){
		if (next_o[i].always_on_top == true){
			canvas.bringToFront( next_o[i] );
		};
	}; 
};

function add_layer(){
	var o = canvas.getActiveObject();
	var img;
	var name = '物件';
	if (o.type == 'image'){
		img = '<img src="'+o._originalImage.attributes.src.value+'" width="50">';
		
		var filename = o._originalImage.attributes.src.value.split('/');
		filename = filename[filename.length-1];
		name = filename;
	}
	if (o.type == 'text'){
		img = '<img src="painter/images/text.png" width="50">';
		name = o.text;
	}
		
	
	
	var new_layer = '<div id="layer_id_'+o.id+'" class="layer_block">'+
				img+
				'<span id="layer_name">'+name+'</span>'+
				'</div>';
	console.log(new_layer);
	$("#layer_list").prepend(new_layer);
};


function completed(){
	$("#dialog").dialog({width: 350}).css({'font-size':'12px'});
	/*
	if (confirm('[完成製作]: 是否需美工人員預覽作品並提供建議? \n\n 完成製作後使用者只能預覽，不能修改作品。')){
		$.get('HandlerPainter.ashx?action=finish_painter',{'order_detail_id':order_detail_id,'painter_id': painter_id},function(data){
	
		});
	}
	*/
	
};

function close_work_list(){
	$("#work_list").hide();
};
function get_work_list(){
	var json = {};
	json.order_id = order_id;
	var json = jQuery.parseJSON(JSON.stringify(json));
	$.ajax({
		dataType: "json",
		url: 'HandlerPainter.ashx?action=get_work_list',
		data: json,
		success: function (data) {
			if (data.id == '000'){
				$("#work_list").html("");
				var wl = JSON.parse(data.message);
				$.each(wl.work_list, function(k, v){
					console.log(v.painter_status);
					if (v.painter_status == 'open')
						cls = 'class="open_work_list" onclick="exchange_painter(\''+v.order_detail_id+'\');"';
					else
						cls = 'class="finish_work_list" ';
					var work_list  = '<div '+cls+'>'+v.product_type+': '+v.product_spec+' (W):'+v.width+' (H):'+v.height+'</div>';
					$("#work_list").append(work_list);
				});
				$("#work_list").append('<label style="cursor:pointer;float:right" onclick="close_work_list()">[關閉]</a></label>');
				$("#work_list").show();
			}
			
		}
	});

};

function exchange_painter(id){
	order_detail_id = id;
	close_work_list();
};

function close_reference(){
	$("#reference_block").hide();
};

function open_reference(){
	$("#reference_block").html('<img src="painter/images/reference_photo.jpg">');
	$("#reference_block").append('<label style="cursor:pointer;float:right" onclick="close_reference()">[關閉]</a></label>');
	$("#reference_block").show();
};

function save(){
	var json = {};
	var objects = canvas._objects;
	
	json.painter = painter_id;
	json.order_id = order_id;
	json.order_detail_id = order_detail_id;
	json.properties = [];
	$.each(objects, function(k, v){
		if(k>0){
			var d = {};
			json.properties.push(d);
			
			d.painter_id = painter_id;
			d.user_name =  session_name;
			d.layer_index = k;
			d.object_index = v.id;
			d.type = v.type;
			d.top = v.top;
			d.left = v.left;
			d.width = v.width;
			d.height = v.height;
			d.selectable = v.selectable;
			d.opacity = v.opacity;
			d.scaleX = v.scaleX;
			d.scaleY = v.scaleY;
			d.fill = v.fill;
			d.radius = v.radius;
			d.angle = v.angle;
			d.stroke = v.stroke;
			d.strokeWidth = v.strokeWidth;
			d.strokeDashArray = v.strokeDashArray;
			d.filename = v.filename;
			d.action_function = '';
			d.step_name = '';
			d.isdelete = 'N';
			json.properties.push();
		};
	});
	
	console.log(json);
};

function update_artist(){
	var json = {};
	json.painter_id = painter_id;
	if ($("#confirm_for_artist:checked").val() == "Y")
		json.artist = "Y";
	else
		json.artist = "N";
	var json = jQuery.parseJSON(JSON.stringify(json));
	$.ajax({
		dataType: "json",
		url: 'HandlerPainter.aspx?action=update_artist',
		data: json,
		success: function (data) {
			if (data.id == '000'){
				
			}
			
		}
	});
};
/*
o = canvas.getActiveObject();
o.clipTo = function(ctx){
console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
console.log(ctx);
console.log(ctx.getImageData(0,0,50,50));
ctx.save();
ctx.beginPath();
ctx.rect(10, 10, 50, 50);
ctx.closePath();
ctx.restore();
}

//http://fabricjs.com/patterns/





*/

//loadPattern('file:///E:/painter/painter/albums/8.png');
/*
function loadPattern(url) {
  fabric.util.loadImage(url, function(img) {
	var o = canvas.getActiveObject();
	//o.fill = new fabric.Pattern({
    text.fill = new fabric.Pattern({
      source: img,
      repeat: 'no-repeat'
    });
    canvas.renderAll();
  });
};


var text = new fabric.Text('Honey,\nI\'m subtle', {
  fontSize: 250,
  left: 50,
  top: 200,
  lineHeight: 1,
  originX: 'left',
  fontFamily: 'Helvetica',
  fontWeight: 'bold'
});
canvas.add(text);
*/

/*
(function(){
  var imagecanvas = document.createElement('canvas');
  var imagecontext = imagecanvas.getContext('2d');

  window.addEventListener('load', function(){
    [].forEach.call(document.querySelectorAll('.mask'), function(img){
      var width  = img.offsetWidth;
      var height = img.offsetHeight;

      var mask = document.createElement('img');
      mask.src = img.getAttribute('data-mask');

      imagecanvas.width  = width;
      imagecanvas.height = height;

      imagecontext.drawImage(mask, 0, 0, width, height);
      imagecontext.globalCompositeOperation = 'source-atop';
      imagecontext.drawImage(img, 0, 0);

      img.src = imagecanvas.toDataURL();
    });
  }, false);

})();


<img src="red-panda.jpg" alt="Red panda" class="mask" data-mask="centerblur.png">
<img src="red-panda.jpg" alt="Red panda" class="mask" data-mask="star.png">

http://codepo8.github.io/canvas-masking/


REFERENCE: globalCompositeOperation  
https://developer.mozilla.org/samples/canvas-tutorial/6_1_canvas_composite.html
*/