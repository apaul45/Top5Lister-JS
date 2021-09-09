import jsTPS from "../common/jsTPS.js"
import Top5List from "./Top5List.js";
import ChangeItem_Transaction from "./transactions/ChangeItem_Transaction.js"
 
/**
* Top5Model.js
*
* This class provides access to all the data, meaning all of the lists.
*
* This class provides methods for changing data as well as access
* to all the lists data.
*
* Note that we are employing a Model-View-Controller (MVC) design strategy
* here so that when data in this class changes it is immediately reflected
* inside the view of the page.
*
* @author McKilla Gorilla
* @author ?
*/
export default class Top5Model {
   constructor() {
       // THIS WILL STORE ALL OF OUR LISTS
       this.top5Lists = [];
 
       // THIS IS THE LIST CURRENTLY BEING EDITED
       this.currentList = null;
 
       // THIS WILL MANAGE OUR TRANSACTIONS
       this.tps = new jsTPS();
 
       // WE'LL USE THIS TO ASSIGN ID NUMBERS TO EVERY LIST
       this.nextListId = 0;
   }
 
   getList(index) {
       return this.top5Lists[index];
   }
 
   getListIndex(id) {
       for (let i = 0; i < this.top5Lists.length; i++) {
           let list = this.top5Lists[i];
           if (list.id === id) {
               return i;
           }
       }
       return -1;
   }
 
   setView(initView) {
       this.view = initView;
   }
 
   addNewList(initName, initItems) {
       let newList = new Top5List(this.nextListId++);
       if (initName)
           newList.setName(initName);
       if (initItems)
           newList.setItems(initItems);
       this.top5Lists.push(newList);
       this.sortLists();
       this.saveLists();
       return newList;
   }
   deleteList(id){
       let listIndex = this.getListIndex(id);
       //For updating id to reflect new position in array
       // for (let i = index+1; i<this.top5Lists.length; i++){
       //     this.top5Lists[i].setId(this.top5Lists.getId()--);
       // }
       this.top5Lists.splice(listIndex, 1);
       let listsElement = document.getElementById("sidebar-list");
       listsElement.removeChild(document.getElementById("top5-list-" + id));
   }
   sortLists() {
       this.top5Lists.sort((listA, listB) => {
           if (listA.getName().toLowerCase() < listB.getName().toLowerCase()) {
               return -1;
           }
           else if (listA.getName().toLowerCase() === listB.getName().toLowerCase()) {
               return 0;
           }
           else {
               return 1;
           }
       });
       this.view.refreshLists(this.top5Lists);
   }
 
   hasCurrentList() {
       return this.currentList !== null;
   }
 
   unselectAll() {
       for (let i = 0; i < this.top5Lists.length; i++) {
           let list = this.top5Lists[i];
           this.view.unhighlightList(list.getId());
       }
   }
 
   loadList(id) {
       let list = null;
       let found = false;
       let i = 0;
       while ((i < this.top5Lists.length) && !found) {
           list = this.top5Lists[i];
           if (list.id === id) {
               // THIS IS THE LIST TO LOAD
               this.currentList = list;
               this.view.update(this.currentList);
               this.view.highlightList(id);
               found = true;
           }
           i++;
       }
       this.tps.clearAllTransactions();
       this.view.updateToolbarButtons(this);
   }
   /* Checks to see if there are lists stored in the browser's local storage, and
   retrieves those lists if so */
   loadLists() {
       // CHECK TO SEE IF THERE IS DATA IN LOCAL STORAGE FOR THIS APP
       let recentLists = JSON.parse(localStorage.getItem("recent_work"));
       if (!recentLists) {
           return false;
       }
       else {
           let listsJSON = recentLists;
           this.top5Lists = [];
           for (let i = 0; i < listsJSON.length; i++) {
               let listData = listsJSON[i];
               let items = [];
               for (let j = 0; j < listData.items.length; j++) {
                   items[j] = listData.items[j];
               }
               this.addNewList(listData.name, items);
           }
           this.sortLists();  
           this.view.refreshLists(this.top5Lists);
           return true;
       }       
   }
 
   saveLists() {
       // WILL THIS WORK? @todo
       let top5ListsString = JSON.stringify(this.top5Lists);
       localStorage.setItem("recent_work", top5ListsString);
   }
 
   restoreList() {
       this.view.update(this.currentList);
   }
 
   addChangeItemTransaction = (id, newText) => {
       // GET THE CURRENT TEXT
       let oldText = this.currentList.items[id];
       let transaction = new ChangeItem_Transaction(this, id, oldText, newText);
       this.tps.addTransaction(transaction);
   }
 
   changeItem(id, text) {
       this.currentList.items[id] = text;
       this.view.update(this.currentList);
       this.saveLists();
   }
 
   // SIMPLE UNDO/REDO FUNCTIONS
   undo() {
       if (this.tps.hasTransactionToUndo()) {
           this.tps.undoTransaction();
           this.view.updateToolbarButtons(this);
       }
   }
}
