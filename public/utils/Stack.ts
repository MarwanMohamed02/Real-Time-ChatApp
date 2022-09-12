
class Stack<T> {
    private top: number
    arr: T[]

    constructor({ top = -1, size = 10, arr = undefined }) {
        this.top = top;
        this.arr = arr? arr: new Array<T>(0);
    }

    push(element: T) {
        // if (this.top + 1 === this.size) {
        //     this.size *= 2;
        //     const newArr = new Array<T>(this.size)
        //     for (let i = 0; i <= this.top; i++) {
        //         newArr[i] = this.arr[i];
        //     }
        //     this.arr = newArr;
        // }
        // this.arr[++this.top] = element;
        this.arr.push(element);
        this.top++;
    }

    pop(): T {
        return this.arr[this.top--];
    }

    contains(element: T): boolean {
        let found = false;       

        for (let i = 0; i <= this.top; i++) {
            if (element === this.arr[i]) {
                found = true;
                break;
            }
        }

        return found;
    }

    remove(element: T) {
        if (this.contains(element)) {
            this.arr = this.arr.filter(e => e !== element);
            this.top--;
        }
    }
    
    isEmpty(): boolean { return this.top === -1 }
}



export default Stack;