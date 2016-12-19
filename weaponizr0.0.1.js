
let Weaponizr = v => Weaponizr[v];
Weaponizr.get = (prop) => Weaponizr[prop];
Weaponizr.setEndPoint = (endPoint, auth) => {
  this.endPoint = endPoint;
  return endPoint;
};
Weaponizr.create = (varName, type) => {
  if (Weaponizr[varName] !== undefined) {
    return true;
  }
  Weaponizr[varName] = new Proxy({element:[]}, h);
  Weaponizr[varName].get = (prop) => {
    if (prop) {
      if (Array.isArray(Weaponizr[varName].value)) {
        return Weaponizr[varName].value[prop];
      } else {
        if (!Weaponizr[varName][prop]) {
          return Weaponizr[varName][prop] = false;
        }
        return Weaponizr[varName][prop];
      }
    }
    else {
      if (!Weaponizr[varName].value) {
        return Weaponizr[varName].value = false;
      }
      return Weaponizr[varName].value;
    }
  };
  Weaponizr[varName].set = (v, prop) => {
    if (prop === undefined ) {
      Weaponizr[varName].value = v;
    } else {
      if (!Array.isArray(Weaponizr[varName].value) && !Weaponizr[varName].type === 'array') {
        Weaponizr[varName][prop] = v;
      } else {
        if (!Weaponizr[varName].value) Weaponizr[varName].value = [];
        Weaponizr[varName].value[prop] = v;
        Weaponizr[varName].value = Weaponizr[varName].get();
      }
    }
    return v;
  };
  Weaponizr[varName].fetch = async (args, credentials) => {
    let argString = '';
    if (typeof args === 'object') {
      for (let key of Object.keys(args)) {
        argString += args[key] + '/';
      }
    }
    return new Promise((resolve, reject) => {
      fetch(this.endPoint + (this.endPoint[this.endPoint.length-1] === '/' ? '' : '/') + varName + '/' + argString, {credentials: credentials ? 'include' : ''}).then(
        (r) => {
          if (!r || !r.ok) {
            return reject(r);
          }
          r.json().then(
            (r) => {
              Weaponizr[varName].set(r[varName]);
              resolve(r);
            }
          );
        });
      });
  };
  Weaponizr[varName].send = async (args, credentials) => {
    let argString = '';
    if (typeof args === 'object') {
      for (let key of Object.keys(args)) {
        argString += args[key] + '/';
      }
    }
    return new Promise((resolve, reject) => {
      let opts = {
        method: 'POST',
        headers: new Headers({"Content-Type": "application/json"}),
        credentials: credentials ? 'include' : '',
        body: JSON.stringify(Weaponizr[varName].get()),
      };
      fetch(this.endPoint + (this.endPoint[this.endPoint.length-1] === '/' ? '' : '/') + varName + '/' + argString, opts).then(
        (r) => {
          if (!r || !r.ok) {
            return reject(r);
          }
          r.json().then(
            (r) => {
              Weaponizr[varName].set(r[varName]);
              resolve(r);
            }
          );
        });
      });
  };
  if (type === 'array') {
    Weaponizr[varName].push = (v) => {

      try {
        Weaponizr[varName].set(v, Weaponizr[varName].value.length);
      } catch(e) {
        Weaponizr[varName].set(v,0);
      }

      return Weaponizr[varName].get();
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
            doWeapons(el.element);
          } catch(e) {
            // throws an error if you can't set the innerHTML, e.g. with a form element
          }
        }
        if (el.type === 'show') {
          if (z !== null && z !== undefined && z !== false) {
            el.element.style.display = el.display;
          } else {
            el.element.style.display = 'none';
          }
        }
        if (el.type === 'attributes') {
          for (var attribute of Object.keys(z)) {
            el.element.setAttribute(attribute, z[attribute]);
          }
          doWeapons(el.element);
        }
        if (el.type === 'css') {
          let keys = Object.keys(z);
          for (key of keys) {
            // deliberately no error checking - error will be thrown for illegal CSS prop value
            el.element.style[key] = z[key] !== 'computed' ? z[key] : el.element.originalStyle[key];
            // using 'computed' will reset it to the original (computed) CSS value-- so not 1em e.g. but 16px.
          }
        }
        if (el.type === 'class') {
          // needs to execute on next tick, otherwise the browser may group it so it doesn't happen
          // setTimeout(0) doesn't work, neither does requestAnimationFrame
          el.element.className = z;
          // so we use this hack instead, to force redraw on setting class
          // we're safe due to the temp element being created with let: i.e., block-scoped.
          let temp = el.element.offsetHeight;
        }
        if (el.type === 'array') {
          if (!el.element) {
            for (let i = 0; i < x[y].length; i++) {
              let newNode = el.mock.cloneNode();
              newNode.removeAttribute('data-from-array');
              newNode.innerHTML = x[y][i] ? x[y][i].toString() : '';
              for (let attr of newNode.attributes) {
                attr.value = attr.value.replace(/(__n__)/g,i);
              }
              el.parent.appendChild(newNode);
              doWeapons(el.parent);
              el.element = 'dummy';
            }
            return;
          } else {
            let elementsLength = el.parent.children.length;
            for (let i = 0; i < Math.max(x[y].length,elementsLength); i++) {
              let newNode = el.mock.cloneNode();
              newNode.removeAttribute('data-from-array');
              newNode.innerHTML = x[y][i] ? x[y][i].toString() : '';
              for (let attr of newNode.attributes) {
                attr.value = attr.value.replace(/(__n__)/g,i);
              }
              if(el.parent.children[i] && el.parent.children[i].isEqualNode(newNode)) {
                continue;
              } else {
                if (!el.parent.children[i]) {
                  el.parent.appendChild(newNode);
                  continue;
                }
                if (x[y][i] === undefined || x[y][i] === null) {
                  let j = i;
                  while (el.parent.children[j]) {
                    el.parent.removeChild(el.parent.children[j]);
                  }
                  continue;
                }
                el.parent.children[i].replaceWith(newNode);
              }
              doWeapons(el.parent);
            }
          }
        }
      }
    }
    return x[y];
  }
};

var doWeapons = function(root) {

let toWeaponize = root.querySelectorAll('[data-from]');
for (let el of toWeaponize) {
  let varName = el['attributes']['data-from'].value;
  if (!Weaponizr[varName]) {
    Weaponizr.create(varName);
  }
  // cache the element we're weaponizing
  Weaponizr[varName.toString()].element.push({element: el, type: 'primitive'});
}
toWeaponize = root.querySelectorAll('[data-to]');
for (let el of toWeaponize) {
  let value = el['attributes']['data-to'].value;
  let onFunc = value.split(':')[0];
  let varName = value.split(':')[1];
  if (!Weaponizr[varName]) {
    Weaponizr.create(varName);
  }
  el[onFunc] = e => {
    if (typeof Weaponizr[varName].value === 'function') {
      if (e.target.nearestViewportElement) {
        Weaponizr[varName].value(e.target.nearestViewportElement, e);
      } else {
        // propagate clicks on child elements up to their parent which is the one that should fire the click event
        if (e.target.nodeName !== el.nodeName) {
          Weaponizr[varName].value(e.target.parentElement, e);
        } else {
          Weaponizr[varName].value(e.target, e);
        }
      }
    } else {
      if (e.target.nearestViewportElement) {
        Weaponizr[varName].value = e.target.nearestViewportElement.value;
      } else {
        Weaponizr[varName].value = e.target.value;
      }
    }
  };
}
toWeaponize = root.querySelectorAll('[data-from-array]');
for (let el of toWeaponize) {
  let varName = el['attributes']['data-from-array'].value;
  if (el['attributes']['data-from-array'].value.indexOf('__n__') !== -1) {
    let cnt = 0;
    let base = varName;
    varName = base.replace(/(__n__)/g, 0);
    while (Weaponizr[varName]) {
      varName = base.replace(/(__n__)/g, cnt);
      cnt++;
    }
  }

  if (!Weaponizr[varName]) {
    Weaponizr.create(varName, 'array');
  }
  if (!Weaponizr[varName].element.length) {
    Weaponizr[varName].element.push({element: null, type: 'array', mock: el.cloneNode(), parent: el.parentElement});
    Weaponizr[varName].set(Weaponizr[varName].get());
    el.parentElement.removeChild(el);
  }
}
toWeaponize = root.querySelectorAll('[data-show]');
for (let el of toWeaponize) {
  let varName = el['attributes']['data-show'].value;
  if (!Weaponizr[varName]) {
    Weaponizr.create(varName);
  }
  let initialDisplayStyle = el.style.display || 'block';
  if (el.style.display === 'none') {
    initialDisplayStyle = 'block';
  }
  Weaponizr[varName].element.push({element: el, type: 'show', display: initialDisplayStyle});
  if (!Weaponizr[varName].value) el.style.display = 'none';
}
toWeaponize = root.querySelectorAll('[data-css-from]');
for (let el of toWeaponize) {
  let varName = el['attributes']['data-css-from'].value;
  if (el['attributes']['data-css-from'].value.indexOf('__n__') !== -1) {
    let cnt = 0;
    let base = varName;
    varName = base.replace(/(__n__)/g, 0);
    while (Weaponizr[varName]) {
      varName = base.replace(/(__n__)/g, cnt);
      cnt++;
    }
  }
  if (!Weaponizr[varName]) {
    Weaponizr.create(varName);
  }
  Weaponizr[varName].element.push({element: el, type: 'css', style: el.style, originalStyle: Object.assign({}, getComputedStyle(el))});
}
toWeaponize = root.querySelectorAll('[data-class-from]');
for (let el of toWeaponize) {
  let varName = el['attributes']['data-class-from'].value;
  if (!Weaponizr[varName]) {
    Weaponizr.create(varName);
  }
  Weaponizr[varName].element.push({element: el, type: 'class', originalClasses: el.cloneNode().classList});
}
toWeaponize = root.querySelectorAll('[data-attributes-from]');
for (let el of toWeaponize) {
  let varName = el['attributes']['data-attributes-from'].value;
  if (!Weaponizr[varName]) {
    Weaponizr.create(varName);
  }
  Weaponizr[varName].element.push({element: el, type: 'attributes', originalAttributes: el.cloneNode().attributes});
}

}; //end doWeapons;

doWeapons(document);
