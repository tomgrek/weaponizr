let toWeaponize = document.querySelectorAll('[data-from]');
let Weaponizr = v => Weaponizr[v];
Weaponizr.get = (prop) => Weaponizr[prop];
Weaponizr.create = (varName) => {
  Weaponizr[varName] = new Proxy({element:[]}, h);
  Weaponizr[varName].get = (prop) => {
    if (prop)
      return Weaponizr[varName][prop];
    else
      return Weaponizr[varName].value;
  };
  Weaponizr[varName].set = (v, prop) => {
    if (!prop) {
      Weaponizr[varName].value = v;
    } else {
      Weaponizr[varName][prop] = v;
    }
    return v;
  };
}
let h = {
  get: (x,y) => {
    return x[y];
  },
  set: (x,y,z) => {
    x[y] = z;
    if (y === 'value') {
      for (let el of x.element) {
        if (el.type === 'primitive') {
          try {
            // maybe this should be called dangerouslySetInnerHtml...
            el.element.innerHTML = x[y].toString();
            el.element.value = x[y].toString();
          } catch(e) {
            // throws an error if you can't set the innerHTML, e.g. with a form element
          }
        }
        if (el.type === 'show') {
          if (z !== null && z !== undefined) {
            el.element.style.display = el.display;
          } else {
            el.element.style.display = 'none';
          }
        }
        if (el.type === 'css') {
          let keys = Object.keys(z);
          for (key of keys) {
            // deliberately no error checking - error will be thrown for illegal CSS prop value
            el.element.style[key] = z[key];
          }
        }
        if (el.type === 'array') {
          let parent = el.element.parentElement;
          let siblings = parent.childNodes;
          let siblingsLength = siblings.length;
          console.log(parent,siblings,siblingsLength);
          for (let i = 0; i < Math.max(x[y].length,siblingsLength); i++) {
            if (siblings[i] && x[y][i]) {
              siblings[i].innerHTML = x[y][i];
            } else {
              if (x[y][i]) {
                let newNode = siblings[0].cloneNode(false);
                newNode.innerHTML = x[y][i].toString();
                parent.appendChild(newNode);
              } else {
                parent.removeChild(siblings[siblings.length-1]);
              }
            }
          }
        }
      }
    }
    return x[y];
  }
};


for (let el of toWeaponize) {
  let varName = el['attributes']['data-from'].value;
  if (!Weaponizr[varName]) {
    Weaponizr.create(varName);
  }
  // cache the element we're weaponizing
  Weaponizr[varName.toString()].element.push({element: el, type: 'primitive'});
}
toWeaponize = document.querySelectorAll('[data-to]');
for (let el of toWeaponize) {
  let value = el['attributes']['data-to'].value;
  let onFunc = value.split(':')[0];
  let varName = value.split(':')[1];
  if (!Weaponizr[varName]) {
    Weaponizr.create(varName);
  }
  el[onFunc] = e => {
    if (typeof Weaponizr[varName].value === 'function') {
      Weaponizr[varName].value(e);
    } else {
      Weaponizr[varName].value = e.target.value;
    }
  };
}
toWeaponize = document.querySelectorAll('[data-from-array]');
for (let el of toWeaponize) {
  let varName = el['attributes']['data-from-array'].value;
  if (!Weaponizr[varName]) {
    Weaponizr.create(varName);
  }
  Weaponizr[varName].element.push({element: el, type: 'array'});
}
toWeaponize = document.querySelectorAll('[data-show]');
for (let el of toWeaponize) {
  let varName = el['attributes']['data-show'].value;
  if (!Weaponizr[varName]) {
    Weaponizr.create(varName);
  }
  Weaponizr[varName].element.push({element: el, type: 'show', display: el.style.display || 'block'});
  if (!Weaponizr[varName].value) el.style.display = 'none';
}
toWeaponize = document.querySelectorAll('[data-css-from]');
for (let el of toWeaponize) {
  let varName = el['attributes']['data-css-from'].value;
  if (!Weaponizr[varName]) {
    Weaponizr.create(varName);
  }
  Weaponizr[varName].element.push({element: el, type: 'css'});
}
