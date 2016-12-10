let toWeaponize = document.querySelectorAll('[data-from]');
let Weaponizr = v => Weaponizr[v];
Weaponizr.get = (prop) => Weaponizr[prop];
Weaponizr.create = (varName, type) => {
  Weaponizr[varName] = new Proxy({element:[]}, h);
  Weaponizr[varName].get = (prop) => {
    if (prop) {
      if (Array.isArray(Weaponizr[varName].value)) {
        return Weaponizr[varName].value[prop];
      } else {
        return Weaponizr[varName][prop];
      }
    }
    else
      return Weaponizr[varName].value;
  };
  Weaponizr[varName].set = (v, prop) => {
    if (!prop) {
      Weaponizr[varName].value = v;
    } else {
      if (!Array.isArray(Weaponizr[varName].value)) {
        Weaponizr[varName][prop] = v;
      } else {
        Weaponizr[varName].value[prop] = v;
        Weaponizr[varName].value = Weaponizr[varName].get();
      }
    }
    return v;
  };
  if (type === 'array') {
    Weaponizr[varName].push = (v) => {
      Weaponizr[varName].set(v, Weaponizr[varName].value.length);
      return Weaponizr[varName].value = Weaponizr[varName].get();
    }
    Weaponizr[varName].pop = () => {
      let temp = Weaponizr[varName].value.pop();
      Weaponizr[varName].value = Weaponizr[varName].get();
      return temp;
    }
  }
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
          let parent = el.element; // el.element.parentElement
          // not childNodes as it returns ::before and ::after also
          let siblings = parent.children;
          let siblingsLength = siblings.length;
          for (let i = 0; i < Math.max(x[y].length,siblingsLength); i++) {
            let newNode = document.createElement('div'); //siblings[0].cloneNode(false);
            newNode.innerHTML = x[y][i] ? x[y][i].toString() : '';
            newNode = newNode.firstChild;
            if (siblings[i] && x[y][i]) {
              if (!siblings[i].isEqualNode(newNode)) {
                siblings[i].replaceWith(newNode);
              };
            } else {
              if (x[y][i]) {
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
    Weaponizr.create(varName, 'array');
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
