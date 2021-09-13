/**
 * Top5List.js
 * 
 * This class represents a list with all the items in our Top5 list.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
 export default class Top5List {
    constructor(initId) {
        this.id = initId;
    }
    setId(id){
        this.id = id;
    }
    getId(){
        return this.id;
    }
    getName() {
        return this.name;
    }

    setName(initName) {
        this.name = initName;
    }

    getItemAt(index) {
        return this.items[index];
    }

    setItemAt(index, item) {
        this.items[index] = item;
    }
    //setItems is what set the array containing the items for a specific Top5List object
    setItems(initItems) {
        this.items = initItems;
    }
    getItems(){
        return this.items;
    }
    moveItem(oldIndex, newIndex) {
        //At position of new index, add 
        this.items.splice(newIndex, 0, this.items.splice(oldIndex, 1)[0]);
    }
}