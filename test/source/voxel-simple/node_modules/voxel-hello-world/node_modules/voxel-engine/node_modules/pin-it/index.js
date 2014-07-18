module.exports = pin

var pins = {}
  , stack_holder = {}
  , pin_holder

function make_pin_for(name, obj) {
  var container = document.createElement('div')
    , header = document.createElement('h4')
    , body = document.createElement('pre')

  container.style.background = 'white'
  container.style.marginBottom = '4px'
  container.appendChild(header)
  container.appendChild(body)
  header.textContents = header.innerText = obj && obj.repr ? obj.repr() : name
  body.style.padding = '8px'


  if(!pin_holder) {
    pin_holder = document.createElement('div')
    pin_holder.style.position = 'absolute'
    pin_holder.style.top =
    pin_holder.style.right = '4px'

    document.body.appendChild(pin_holder)
  }

  pin_holder.appendChild(container)

  return (pins[name] = pins[name] || []).push({body: body, last: -Infinity, for_object: obj}), pins[name]
}

function update_pin(item, into, retain, depth) {
  if(!retain) into.innerHTML = ''
  if(depth > 1) return
  depth = depth || 0

  switch(typeof item) {
    case 'number': into.innerText += item.toFixed(3); break
    case 'string': into.innerText += '"'+item+'"'; break
    case 'undefined':
    case 'object':
      if(item) {
        for(var key in item) if(item.hasOwnProperty(key)) {
          into.innerText += key +':'
          update_pin(item[key], into, true, depth+1)
          into.innerText += '\n'
        } 
        break
      }
    case 'boolean': into.innerText += ''+item; break
  }  
}

function pin(item, every, obj, name) {
  if(!name) Error.captureStackTrace(stack_holder)
  var location = name || stack_holder.stack.split('\n').slice(2)[0].replace(/^\s+at /g, '')
    , target = pins[location] || make_pin_for(location, obj)
    , now = Date.now()
    , every = every || 0

  if(arguments.length < 3) target = target[0]
  else {
    for(var i = 0, len = target.length; i < len; ++i) {
    if(target[i].for_object === obj) {
      target = target[i]
      break   
    }
  }
    if(i === len) {
      pins[location].push(target = make_pin_for(location, obj))
    }
  }

  if(now - target.last > every) {
    update_pin(item, target.body)
    target.last = now 
  }
}
