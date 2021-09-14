import jsTPS from "../common/jsTPS.js"
import Top5List from "./Top5List.js";
import ChangeItem_Transaction from "./transactions/ChangeItem_Transaction.js"
import DragAndDropTransaction from "./transactions/DragAndDropTransaction.js";
 
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
       //After deleting the list, disable close and enable add list after clearing items
       //^^ONLY IF THE DELETED LIST WAS THE SELECTED ONE
       if (document.getElementsByClassName("selected-list-card").length == 0){
            this.view.clearWorkspace();
            //Make sure current list is null after a list has been deleted
            this.currentList = null;
            this.view.enableButton("add-list-button");
            this.view.disableButton("close-button");
            document.getElementById("current-list-name").innerHTML = "";
       }
       //Make sure to clear the transaction stack after deletion 
       this.tps.clearAllTransactions();
       this.view.updateToolbarButtons(this);
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
               this.unselectAll();
               this.view.highlightList(id);
               found = true;
           }
           i++;
       }
       //When a list is clicked on, makre sure all transactions on the stack
       //are closed (same for close list)
       this.tps.clearAllTransactions();
       this.view.updateToolbarButtons(this);
       //Make sure close is enabled when a list is loaded
       this.view.enableButton("close-button");
       //Make sure to disable the add list button when a list is loaded
       this.view.disableButton("add-list-button");
       //Make sure 
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
   //If close is pressed and isn't disabled, then close the loaded list and 
   // return the site to a default page
   closeList(){
       this.unselectAll();
       this.view.clearWorkspace();
       document.getElementById("current-list-name").innerHTML = "";
       //Make sure to disable closeList once the loaded list is closed
       this.view.disableButton("close-button");
       //Make sure to enable the addList button once close has been pressed
       this.view.enableButton("add-list-button");
       //Disable both undo and redo
       //When the user closes the list, make sure all transactions on the stack
       //are cleared 
       this.tps.clearAllTransactions();
       this.view.updateToolbarButtons(this);
       this.currentList = null;
   }
   saveLists() {
       // WILL THIS WORK? @todo
       let top5ListsString = JSON.stringify(this.top5Lists);
       localStorage.setItem("recent_work", top5ListsString);
   }
   //Make sure the selected list stays highlighted after refreshList or another method is called
   selectList(){
        if (this.hasCurrentList()){
            this.view.highlightList(this.currentList.getId());
        }
   }
   restoreList() {
       this.view.update(this.currentList);
   }
 
   addChangeItemTransaction = (id, newText) => {
       // GET THE CURRENT TEXT
       let oldText = this.currentList.items[id];
       let transaction = new ChangeItem_Transaction(this, id, oldText, newText);
       this.tps.addTransaction(transaction);
       this.view.updateToolbarButtons(this);
   }
 
   changeItem(id, text) {
       this.currentList.items[id] = text;
       this.view.update(this.currentList);
       this.saveLists();
   }
   addDragItemTransaction = (oldIndex, newIndex) => {
       if (this.hasCurrentList()){
            let oldList = this.currentList.getItems();
            let transaction = new DragAndDropTransaction(this, this.currentList.getItems(), oldIndex, newIndex);
            this.tps.addTransaction(transaction);
            this.view.updateToolbarButtons(this);
       }
   }
   dragDropItem(dragIndex, dropIndex){
       this.currentList.moveItem(dragIndex, dropIndex);
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
   redo(){
       if (this.tps.hasTransactionToRedo()){
           this.tps.doTransaction();
           this.view.updateToolbarButtons(this);
       }
   }
}
