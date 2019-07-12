const uuid = require('uuid/v1');

class Subject {
  constructor() {
    this.observers = [];
  }

  // Using uuid to create a unique id based off of the timestamp created
  // We could have also just stored the highest id created and add to that
  // each time we register an observer, but I'd prefer an actual uuid rather
  // than an incremental numerical id.
  registerObserver(cb, id = uuid()) {
    this.observers = this.observers.concat({id, cb});
    return id;
  }

  // remove observer based off of id. If already removed this filter will do nothing.
  removeObserver(id) {
    this.observers = this.observers.filter(observer => observer.id !== id);
  }

  // Pass any message onto the observers in order.
  notifyObservers(message) {
    this.observers.forEach(observer => observer.cb(message));
  }
}

class Counter extends Subject {
  constructor(props) {
    super(props);

    this.count = 0;
  }

  update() {
    this.count = this.count + 1;
    this.notifyObservers(this.count);
  }
}

class CountDisplay {
  constructor(subject) {
    // Allows us to read the current count without asking the subject for it
    this.count = 0;

    // Lets us unsubscribe by calling the subscribe.removeObserver method with the id we get later
    this.subject = subject;

    // We needed to change updates this as we call it later from a different object.
    this.update = this.update.bind(this);

    // We store the id so we can unregister with it at a later time.
    this.id = this.subject.registerObserver(this.update);
  }

  display() {
    console.log(this.count);
  }

  update(count) {
    this.count = count;
    this.display();
  }

  unregister() {
    this.subject.removeObserver(this.id);
  }

  register() {
    this.subject.registerObserver(this.update, this.id);
  }
}

// This is me messing with the new code, testing it does the correct thing
(() => {
  const counter = new Counter();

  const countDisplay = new CountDisplay(counter);
  console.log('creating a count display, displaying the count');
  countDisplay.display();

  const countDisplay2 = new CountDisplay(counter);
  console.log('creating a second display, displaying the count');
  countDisplay2.display();

  console.log(
    'updating the count 3 times. We should see the update method for each countDisplay be called, resulting in a console.log for both countDisplays',
  );
  counter.update();
  counter.update();
  counter.update();

  console.log('unregistering the second countDisplay');
  countDisplay2.unregister();

  console.log(
    'updating the count. the first display should be the only display to console log',
  );
  counter.update();
  console.log('the second countDisplay should still be 3');
  countDisplay2.display();

  console.log('registering countDisplay2 again');
  countDisplay2.register();
  console.log(
    'The count has not changed, we should still see 3 for countDisplay2',
  );
  countDisplay2.display();
  console.log(
    'We could fix this by raising the state into the Subject class, and calling the notifySubscribers method with the state each time we add to the list of subscribers... ah well',
  );
  console.log('updating the counter again');
  counter.update();

  console.log(
    'and we see 2 updates again, and coundDispllay2 has the latest value',
  );
})();
