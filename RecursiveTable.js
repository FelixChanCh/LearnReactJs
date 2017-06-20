import React from 'react';
import { Icon, Container, Segment, Grid, Menu, Button, Comment , Table, Label, Divider, Input } from 'semantic-ui-react';
import {Link} from 'react-router';
import $ from 'jquery'

import {onTableClickResolver} from '../action/Actions'

class RecursiveTable extends React.Component {
	constructor(props) {
		super(props);
		var self = this;
		
		if(props.model){
			console.log("Table data contains model");
		}
		
		this.randName = function(){
			var text = "";
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			for( var i=0; i < 5; i++ )
				text += possible.charAt(Math.floor(Math.random() * possible.length));

			return '"'+text+'"';
		}
		
		this.state = {
			tableName: this.props.name ? this.props.name : this.randName(),
			size: this.props.size ? this.props.size : 'small',
			insert: {},
			edit: false,
			sort: (this.props.sort)?this.props.sort:[]
		};
		
		
		this.insert = this.props.insert;
		if(this.insert != null || typeof this.insert !== 'undefined'){
			this.insert.key = "b-insert";
		}
		
		this.style = this.props.style ? this.props.style : {};
		this.style.width = '100%';
		this.style.overflowX = 'auto';
		
		this.verticalAlign = this.props.verticalAlign ? this.props.verticalAlign : 'top';
		
		this.narrowPadding = {};
		if(this.state.size === 'small') {
			this.narrowPadding.paddingTop = '4px';
			this.narrowPadding.paddingBottom = '4px';
			this.narrowPadding.paddingLeft = '6px';
			this.narrowPadding.paddingRight = '6px';
		}
		if(this.props.narrowPaddingX) {
			this.narrowPadding.paddingLeft = this.props.narrowPaddingX;
			this.narrowPadding.paddingRight = this.props.narrowPaddingX;
		}
		if(this.props.narrowPaddingY) {
			this.narrowPadding.paddingTop = this.props.narrowPaddingY;
			this.narrowPadding.paddingBottom = this.props.narrowPaddingY;
		}
		
		this.color = this.props.color ? this.props.color : null;
		this.striped = this.props.striped ? this.props.striped : false;
		this.compact = this.props.compact ? this.props.compact : 'very';
		this.borderless = this.props.borderless ? 0 : null;
		
		this.selectable = this.props.selectable ? this.props.selectable : false;
		this.buttons = this.props.buttons ? this.props.buttons : null;
	
		
		
		this.getModel = function(key){
			var m = self.props.model;
			if(m){
				var match = m.columns.filter(n => n.key === key);
				if(match.length > 0){
					// there is model definition
					var model = match[0];
					
					// normalize model definition
					var defaultName = "" + key;
					if(model.display_name == null || typeof model.display_name === 'undefined'){
						model['display_name'] = defaultName.capitalizeFirstLetter();
						//console.log(model['display_name']);
					}
					if(model.disabled === true) model.disabled = true; else model.disabled = false;
					if(model.hidden === true) model.hidden = true; else model.hidden = false;
					
					//console.log(model);
					return model;
				}
				
				// If model is defined but missing the definition of a column, hide it and disable it
				return  {
					key: key,
					display_name: key,
					disabled: true,
					hidden: true
				}
			}
			// If model is not defined, show and disable all columns
			return {
				key: key,
				display_name: key,
				disabled: false,
				hidden: false,
			}
		}
			//console.log("---------------------------");
		
		this.setHeaderRowData = function(init){
			// key: {table name}, "head", {column pos}
			let tempList = (self.props.list === null || typeof self.props.list === 'undefined') ? [] : self.props.list;
			let list = Array.isArray(tempList) ? tempList : [tempList];
			
			var model;
			
			if(self.props.model != null && typeof self.props.model !== 'undefined'){
				model = self.props.model.columns.map(column => {
					return self.getModel(column.key);
				}).filter(column => {
					if(column.hidden){
						return false;
					}
					return true;
				});
				
			} else {
				var countKeys = 0;
				for(var i=0; i<list.length; i++){
					countKeys = Math.max(Object.keys(list[i]).length,countKeys);
				}
		
				var headerKeys = {};
				for(var i=0; i<list.length; i++){
					var obj = Object.keys(list[i]);
					if(countKeys == obj.length){
						headerKeys = list[i]
					}
				}
				model = Object.keys(headerKeys).map(key => {
					return self.getModel(key);
				}).filter(column => {
					if(column.hidden){
						return false;
					}
					return true;
				});
			}
			//console.log(model);
			if(init){
				self.state.headerRow = model;
				self.state.list = list;
			} else {
				self.setState({list: list, headerRow: model});
			}
		}
		
		this.setBodyRowsData = function(init, callback){
			const headerRow = self.state.headerRow;
			const list = self.state.list;
			//console.log('list');
			//console.log(list);
			
			var rows = [];
			for(var i=0; i<list.length; i++){
				var row = self.getBodyRowData(headerRow, list[i], i);
				rows.push(row);
			}
			if(init){
				self.state.bodyRows = rows;
				if(callback !== null && typeof callback === 'function')
					callback(rows);
			} else {
				self.setState({bodyRows: rows}, ()=>{
					if(callback !== null && typeof callback === 'function')
						callback(rows);
				});
			}
		}
		this.getBodyRowData = function(headerRow, dirtyBodyRow, i){
			// key: {table name}, "row", {row pos}, {column pos}
			
			var bodyRowData = {};
			for(var k=0; k<headerRow.length; k++){
				var iKey = headerRow[k].key;
				bodyRowData[iKey] = dirtyBodyRow[iKey];
			}
			return bodyRowData;
		}
		this.setEditData = function(init){
			Object.values(self.state.bodyRows).map((row, i) => {
				let rowId = self.state.tableName + ',"row","' + i + '"';
				
				const newData = {};
				
				Object.keys(row).map((key, i) => {
					newData[key] = row[key];
				});
				
				if(init){
					self.state[rowId+"_data"] = newData;
				} else {
					var obj = {};
					obj[rowId+"_data"] = newData;
					self.setState(obj);
				}
			});
		}
		this.sortBy = function(key){
			const {list, sort, currentPage} = self.state;
			
			// Currently useless (for multiple sorting)
			var existing = false;
			sort.map(function(s){
				if(s.key === key){
					existing = true;
					s.ascending = !s.ascending;
				}
			})
			if(!existing){
				// Default ascending, so the first click is descending
				sort.push({key:key, ascending: false});
			}
			
			var currentSort = sort.filter((s)=>{return s.key === key})[0];
			
			list.sort(function(a, b){
				var testA = a[currentSort.key].toLowerCase();
				var testB = b[currentSort.key].toLowerCase();
				if (testA < testB) //sort string ascending
					return currentSort.ascending?-1:1;
				if (testA > testB)
					return currentSort.ascending?1:-1;
			});
			
			self.setState({sort: [currentSort], list: list}, function(){
				if(self.paging !== false){
					console.log('go thor');
					self.setPage(false, 0, list);
				} else {
					self.setBodyRowsData(false);
				}
			});
		}
		this.setPage = function(init, pageNo, customList){
			if(pageNo>=0 && pageNo<self.state.pageAmount || init || customList){
				self.paging = self.props.paging ? self.props.paging : false;
				if(self.paging !== false){
					// Resolve row data from list
					self.setBodyRowsData(init, function(rows){
						var pageSize = self.paging.page;
						var allList = [];
						
						// Crop list of all rows to page list
						while (rows.length > 0)
							allList.push(rows.splice(0, pageSize));
						
						console.log(allList[pageNo])
						if(init){
							self.state.bodyRows = allList[pageNo];
							self.state.currentPage = pageNo;
							self.state.pageAmount = allList.length;
						} else {
							self.setState({bodyRows: allList[pageNo], currentPage: pageNo, pageAmount: allList.length});
						}
					});
				}
				return;
			}
			if(typeof pageNo !== 'number')
				pageNo = 0;
			if(init){
				self.state.currentPage = pageNo;
			} else {
				self.setState({currentPage: pageNo});
			}
		}
		
		this.setHeaderRowData(true);
		if(this.props.paging !== false && this.props.paging != null){
			this.setPage(true, 0);
		} else {
			this.setBodyRowsData(true);
		}
		
		this.getHeaderRow = function(){
			return (
				<Table.Row  verticalAlign={self.verticalAlign}>
					{self.state.headerRow.map(row => {
						if(self.state.sort !== false){
							var sortThis = self.state.sort.filter((s)=>{
								return s.key === row.key;
							})
						
							let ascending = true;
							if(sortThis.length > 0){
								ascending = sortThis[0].ascending;
							}
							var arrowDirection = "angle down";
							if(!ascending){
								arrowDirection = "angle up";
							}
							
							return (
								<Table.HeaderCell key={self.state.tableName + ',"head","' + row.key + '"'} style={Object.assign(self.narrowPadding, {borderRadius:self.borderless})}>
									{ row.display_name }
									<Button basic color={this.props.color} style={{float: 'right', width: 22, height: 22, borderRadius: 25, padding: 2}} circular icon={arrowDirection} onClick={()=>{self.sortBy(row.key)}} />
								</Table.HeaderCell>
							);
						} else {
							return (
								<Table.HeaderCell key={self.state.tableName + ',"head","' + row.key + '"'} style={self.narrowPadding}>
									{ row.display_name }
								</Table.HeaderCell>
							);
						}
					})}
					{ self.buttons || self.insert ?
						<Table.HeaderCell key={self.state.tableName + ',"head","actions"'} verticalAlign={self.verticalAlign} textAlign={'right'} style={self.narrowPadding}>
							Actions
						</Table.HeaderCell>	
					: null }
				</Table.Row> 
			);
		}
		this.getBodyRows = function(){
			return self.state.bodyRows.map((row, i) => {
				let rowId = self.state.tableName + ',"row","' + i + '"';
				return (
					<Table.Row verticalAlign={self.verticalAlign} key={rowId}>
						{self.getBodyRow(row, rowId)}
						{self.buttons || self.insert ?
							self.getBodyActionCell(row, rowId)
						: null}
					</Table.Row>
				);
			});
		}
		this.getBodyRow = function(row, rowId){
			return Object.keys(row).map((key, i) => {
				var columnId = rowId + ',"' + i + '"';
				//console.log(columnId);
				var columnValue = row[key];
				return (
					<Table.Cell key={columnId} style={self.narrowPadding} 
						onClick={(p,e) => onTableClickResolver(p,e,columnId,row,self.fieldClickHandler)}>
						{ $.isArray(columnValue)  ?
							(columnValue.length > 0) ? 
								<RecursiveTable name={columnId + ',"subTable"'} 
									fieldClickHandler={self.fieldClickHandler} list={columnValue} 
									borderRadius={self.borderless} striped={self.striped} selectable={self.selectable} 
									compact={self.compact} size={self.state.size} color={self.color} /> 
							: <div>{columnValue}</div> 
						:
						typeof columnValue === 'object' && columnValue != null ?
							<RecursiveTable name={columnId + ',"subTable"'} 
								fieldClickHandler={self.fieldClickHandler} list={columnValue} 
								borderRadius={self.borderless} striped={self.striped} selectable={self.selectable} 
								compact={self.compact} size={self.state.size} color={self.color} /> 
						:
						columnValue === true ?
							<div>true</div>
						:
						columnValue === false ?
							<div>false</div>
						:
							<div>
							{this.state[rowId] && !this.state.headerRow[i].disabled ?
								<div>
									<input style={{width:'100%',margin:3,padding:5,border: '1px solid #EEE'}} 
										onChange={(p,e)=>{
											const newData = self.state[rowId+"_data"];
											newData[key] = p.target.value;
											
											var obj = {};
											obj[rowId+"_data"] = newData;
											self.setState(obj);
										}}
										value={self.state[rowId+"_data"][key]} />
									<small>{columnValue}</small>
								</div>
							: 
								<div>{columnValue}</div>
							}
							</div>
						}
					</Table.Cell>
				);
			});
		}
		this.getBodyActionCell = function(row, rowId){
			//console.log(row);
			return (
				<Table.Cell key={rowId + ',"action"'} verticalAlign={self.verticalAlign} style={self.narrowPadding} singleLine>
					<Button.Group size='mini' floated="right">
						{function(){
							if(rowId !== self.state.tableName + ',"row","insert"'){
								if(self.buttons){
									return self.buttons.map((obj) => {
										var display = typeof obj.display === 'function' ? obj.display(row) : true;
										if(display && obj.key !== 'edit') {
											return <Button compact 
												key={"bx-"+obj.key} color={obj.color} 
												onClick={function(p,e){
													obj.handler(p, e, row, self, rowId)
												}}>{obj.name}</Button>
												
										} else if(display && obj.key === 'edit') {
											// If this is the edit button
											return <Button compact 
												key={"bx-"+obj.key} color={obj.color} 
												onClick={function(p,e){
													obj.handler(p, e, self.state[rowId+"_data"], self, rowId)
												}}>{self.state[rowId]?'Save':obj.name}</Button>
												
										} else {
											return null;
										}
									});
								}
								return null;
							} else {
								return (
									<Button compact 
										key={"b-insert"} color={self.insert.color} 
										onClick={function(p,e){
											self.insert.handler(p, e, self.state.insert, self, rowId);
										}}>{self.insert.name}</Button>
								);
							}
						}()}
					</Button.Group>
					<div style={{clear:'both'}}></div>
				</Table.Cell>	
			);
		}
		this.getInsertRow = function(){
			let rowId = self.state.tableName + ',"row","insert"';
			return [
				<Table.Row verticalAlign={self.verticalAlign} key={rowId} style={{background:'#FAFAFA'}}>
					{self.state.headerRow.map((row, i) => {
						return (
							<Table.Cell key={rowId + ',"' + i + '"'} style={{padding:1,height:15, boxSizing:'border-box'}}>
								{!row.disabled ?
									<input style={{width:'100%',margin:1,padding:5,border: '1px solid #EEE'}} 
										onChange={(p,e)=>{
											const insert = self.state.insert;
											insert[row.key] = p.target.value;
											self.setState({insert: insert});
										}}
										value={self.state.insert[row.key]}
									/>
								: null}
							</Table.Cell>
						);
					})} 
					{self.getBodyActionCell({}, rowId)}
				</Table.Row> 
			];
		}
		this.getEditRow = function(){
			
		}
		
		this.setEdit = function(rowId){
			self.setEditData();
			var obj = {};
			obj[rowId] = !self.state[rowId];
			self.setState(obj);
			return obj[rowId];
		}
		this.forceRefresh = function(){
			// Force refresh
			setTimeout(function(){
				self.forceUpdate();
				self.setHeaderRowData();
				self.setBodyRowsData();
				self.forceUpdate();
			}, 10);
		}
		this.fieldClickHandler = (this.props.fieldClickHandler) ? this.props.fieldClickHandler : function(){};
		
		
		if(this.props.listen){
			this.props.listen(self);
		}
	}
	
	componentWillMount(){
	}
	
	render() {
		var self = this;
		return (
		<div style={self.style}>
			{/*JSON.stringify(self.state.sort)*/}
			<Table 	style={{borderRadius:self.borderless}} 
					striped={self.striped} 
					selectable={self.selectable} 
					compact={self.compact} 
					size={self.state.size} 
					color={self.color} >
					
				<Table.Header>
					{this.getHeaderRow()}
				</Table.Header>
				
				<Table.Body>
					{this.getBodyRows()}
					{self.insert ?
						self.getInsertRow()
					: null}
					{self.state.edit ?
						self.getEditRow()
					: null}
				</Table.Body>
				
			</Table>
			
			{this.props.paging !== false && this.props.paging != null ? 
			<div style={{paddingBottom:10}}>
				<div style={{float:'right',background:'#FFF',width:65,color:'rgba(0,0,0,.6)',fontSize:'.85714286rem', fontWeight: '400',
					textTransform: 'none',
					textShadow: 'none!important', position:'relative',
					border:'1px solid #DDD',height:33, padding: '5px 15px 0 10px', borderRadius: self.borderless === null ? 4 : 0}}>
					<input onChange={(p,e)=>{
						var value = p.target.value-1;
						self.setPage(false, value);
					}} style={{position:'absolute', fontWeight: '400', 
						color:(self.state.currentPage>=0&&self.state.currentPage<self.state.pageAmount)?'#555':'#FF0000',
						top: 6, left:0,border:'none',padding:'0 4px 0 0 !important',height:20,width:35,textAlign:'right'}} value={self.state.currentPage+1} />
					<div style={{position:'absolute',top:6, left: 37, width:15,fontWeight:'700'}}>/{self.state.pageAmount}</div>
				</div>
				<Button.Group basic floated='left' size="tiny" style={Object.assign({background:'#FFF'},{borderRadius:self.borderless} )} >
					{self.state.currentPage !== 0 ?
					<Button color={this.props.color} icon="caret left" onClick={()=>{self.setPage(false, self.state.currentPage-1)}} />
					:null}
					{function(){
						var jsx = [];
						var showLeftDotDot = false;
						var showRightDotDot = false;
						var i = 0;
						while (i<self.state.pageAmount){
							const count = i;
							if(count!=0 && count < self.state.currentPage-2){
								if(!showLeftDotDot){
									jsx.push(<Button basic key={self.state.tableName+',page-button,left-dot'} disabled>...</Button>);
									showLeftDotDot=true;
								}
							} else if(count!= self.state.pageAmount-1 && count > self.state.currentPage+2){
								if(!showRightDotDot){
									jsx.push(<Button basic key={self.state.tableName+',page-button,rightdot'} disabled>...</Button>);
									showRightDotDot=true;
								}
							} else {
								jsx.push(<Button basic active={self.state.currentPage===count} onClick={()=>{self.setPage(false, count)}} key={self.state.tableName+',page-button,'+count}>{count+1}</Button>);
							}
							i++;
						}
						return jsx;
					}()}
					{self.state.currentPage < self.state.pageAmount-1 ?
						<Button color={this.props.color} icon="caret right" onClick={()=>{self.setPage(false, self.state.currentPage+1)}} />
					:null}
				</Button.Group>
				<div style={{clear:'both'}}></div>
			</div>
			: null}
		</div>
		);
	}
}

export default RecursiveTable
