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
	HanderPainter.ashx?action=get_work_list&user_id=xx&painter_id=123456
	
	[Completed] When user click Completed button then send the action.
	HanderPainter.ashx?action=finish_painter&user_id=xx&painter_id=123456

*/
var active_object;
var newImage;
var active_font;

document.onselectstart = function () { return false; };

function disableF5(e) {
    if ((e.which || e.keyCode) == 116)
        e.preventDefault();
};
$(document).bind("keydown", disableF5);

function change_page(page) {
    $("#photos_page").hide();
    $("#text_page").hide();
    $("#material_page").hide();
    $("#mask_page").hide();
    $("#background_page").hide();
    $(page).show();


};
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
    canvas.remove(canvas.getActiveObject());
	close_right_menu();
};

function add_text() {
    var mytext = $("#add_text").val();
    var new_text = new fabric.Text(mytext, {
        fontFamily: active_font,
        fontSize: 40,
        left: 100,
        top: 100
    });

    canvas.add(new_text);
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


//背景
canvas.setBackgroundImage('painter/background/1.jpg', function(){ canvas.renderAll();})

*/
var canvas = new fabric.Canvas('c');

var real_output_area = new fabric.Rect({
  left: canvas.getWidth() / 2,
  top: canvas.getHeight() / 2,
  fill: 'none',
  width: canvas.getWidth() - 12,
  height: canvas.getHeight() - 12,
  strokeWidth: 1,
  selectable: false,
  strokeDashArray: [2, 2],
  stroke: 'rgba(0, 0, 217)'
});
canvas.add(real_output_area);

var circle = new fabric.Circle({
    radius: 20, fill: 'green', left: 100, top: 100, angle: 45, id : canvas.getObjects().length
});
canvas.add(circle);

var triangle = new fabric.Triangle({
    width: 20, height: 30, fill: 'blue', left: 50, top: 50, id : canvas.getObjects().length
});
canvas.add(triangle);


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

    console.log('event: ', e);

    newImage = new fabric.Image(img, {
        width: img.width,
        height: img.height,
        left: e.layerX,
        top: e.layerY
    });
    canvas.add(newImage);

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

$("#Checkout").click(function () {
	$.getJSON('HandlerCheckOut.ashx?action=insert_item&user_name=a&category=寫真書&prod_id=9', function(data){
		if(data){
			if(data.id == '000'){
				window.location.href = 'checkout.aspx?user_name=a&category=寫真書&prod_id=9';
			};
		};
	});
    
});

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
					canvas.setActiveObject( canvas._objects[k] );
					show_right_menu(env.pageX,env.pageY);
					//console.log(v);
					return false; 
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
	record_step('移到最上層');
};

function object_infront(){
	canvas.bringToFront( canvas.getActiveObject() );
	close_right_menu();
};

function bring_backward(){
	canvas.sendToBack ( canvas.getActiveObject() );
	close_right_menu();
};

function object_behind(){
	canvas.sendBackwards( canvas.getActiveObject() );
	close_right_menu();
};

var db = open_database();
create_database();
var painter_id;
var session_name = '順啦';
var ismoving = false;
get_painter_id();

function open_database(){
	var db = openDatabase('painter','1.0','painter database', 1024 * 20);
	return db;
};

function create_database(){
	db.transaction(function(d){
		d.executeSql('create table IF NOT EXISTS history(id INTEGER PRIMARY KEY AUTOINCREMENT,painter_id integer,user_name text,object_index integer, type text,top real,left real,width real,height real,selectable text,opacity real,scaleX real,scaleY real,fill text,radius real,stroke text,strokeWidth real,strokeDashArray text,filename text,action_function text,step_name text);');
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

	var sql = 'insert into history (painter_id, user_name, object_index, type, top, left, width, height, '+
	'selectable, opacity, scaleX, scaleY, fill, radius, stroke, strokeWidth, strokeDashArray, filename, action_function, step_name)'+
	' values ("'+painter_id+'","'+session_name+'","'+o.id+'","'+o.type+'","'+o.top+'","'+o.left+'","'+o.width+'","'+o.height+'", '+
	' "'+o.selectable+'","'+o.opacity+'", "'+o.scaleX+'", "'+o.scaleY+'", "'+o.fill+'", "'+o.radius+'", "'+o.stroke+'", '+
	' "'+o.strokeWidth+'", "'+o.strokeDashArray+'", "'+filename+'", "'+action_function+'", "'+step_name+'" )';
	
	db.transaction(function(d){
		d.executeSql(sql);
	});
};

canvas.on('object:moving', function(options) {
	if (options.target) {
		ismoving = true;
	}
});

canvas.on('mouse:up', function(options) {
	if (options.target && ismoving == true) {
		record_step('移動');
		undo_id = undefined;
		redo_id = undefined;
//		console.log(options.target);
	}
	ismoving = false;
});
var undo_id;
var undo_result;
var redo_id;
var redo_result;

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

function redo(){
	if (redo_id == undefined)
		redo_id = undo_id+1;
	else
		redo_id++;
	direct_move_circle(redo_id);
	/*
	db.transaction(function(d){
		if (redo_id == undefined)
			var sql = 'select max(id),* from history where painter_id="'+(undo_id+1)+'"; ';
		else
			var sql = 'select * from history where painter_id="'+painter_id+'" and id="'+redo_id+'"; ';
		d.executeSql(sql, [], function(tx, results){
			if(results.rows.length>0){
				get_redo_result(results.rows.item(0));
			}
		});
	});
	*/
};

function undo_move(o){
	console.log('trigger undo_move');
	var next_o = canvas.getObjects();
	for(var i=0; i<= next_o.length-1; i++){
		console.log(next_o[i].id+  '      ' + o.object_index);
		if (next_o[i].id == o.object_index){
			next_o[i].set({top:o.top, left:o.left});
			next_o[i].adjustPosition();
			canvas.renderAll();
		};
	}; 
};

function redo_move(o){
	console.log('trigger redo_move');
	var next_o = canvas.getObjects();
	for(var i=0; i<= next_o.length-1; i++){
		if (next_o[i].id == o.object_index){
			next_o[i].set({top:o.top, left:o.left});
			next_o[i].adjustPosition();
			canvas.renderAll();
		};
	}; 
};

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

/*
{ "order_master_id" : "6",
  "work_list" : [ { "height" : "2",
        "note" : "",
        "order_detail_id" : "57",
        "pages" : "3",
        "painter_id" : "",
        "painter_status" : "open",
        "product_amount" : "3",
        "product_discount" : "0",
        "product_price" : "5",
        "product_spec" : "Gechic ON-LAP 1502I/T 壁掛配件VESA100 支架..客訂, $990 ★",
        "product_type" : "寫真書",
        "width" : "1"
      },
      { "height" : "13213",
        "note" : "",
        "order_detail_id" : "58",
        "pages" : "111",
        "painter_id" : "",
        "painter_status" : "open",
        "product_amount" : "4",
        "product_discount" : "0",
        "product_price" : "123",
        "product_spec" : "Gechic ON-LAP 1502I(IPS面板)/15.6\"觸控式筆記型螢幕/含喇叭/附腳架/可壁掛, $11490 ◆ ★",
        "product_type" : "寫真書",
        "width" : "123"
      },
      { "height" : "2",
        "note" : "",
        "order_detail_id" : "59",
        "pages" : "3",
        "painter_id" : "",
        "painter_status" : "open",
        "product_amount" : "4",
        "product_discount" : "0",
        "product_price" : "5",
        "product_spec" : "Gechic ON-LAP 1502I/T 壁掛配件VESA100 支架..客訂, $990 ★",
        "product_type" : "寫真書",
        "width" : "1"
      },
      { "height" : "2",
        "note" : "",
        "order_detail_id" : "60",
        "pages" : "5",
        "painter_id" : "",
        "painter_status" : "open",
        "product_amount" : "2",
        "product_discount" : "0",
        "product_price" : "123456",
        "product_spec" : "BENQ L24-6500 24吋LED背光,FullHD1080P,USB多媒體播放, $6900 ★",
        "product_type" : "寫真書",
        "width" : "1"
      },
      { "height" : "2",
        "note" : "",
        "order_detail_id" : "61",
        "pages" : "5",
        "painter_id" : "",
        "painter_status" : "open",
        "product_amount" : "1",
        "product_discount" : "0",
        "product_price" : "654321",
        "product_spec" : "Gechic ON-LAP 1302/13.3\"LED/USB供電/僅654g/8mm/附支架, $3990 ◆ ★",
        "product_type" : "寫真書",
        "width" : "1"
      }
    ]
}
*/


