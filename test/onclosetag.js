require(__dirname).test({
    xml: "<root length='12345'><span></root>",
    expect: [
      [
        'opentagstart',
        {
          name: 'root',
          attributes: {}
        }
      ],
      [
        'attribute',
        {
          name: 'length',
          value: '12345'
        }
      ],
      [
        'opentag',
        {
          name: 'root',
          attributes: {
            length: '12345'
          },
          isSelfClosing: false
        }
      ],
      [
        'opentagstart',
        {
          name: 'span',
          attributes: {}
        }
      ],
      [
        'opentag',
        {
          name: 'span',
          attributes: {},
          isSelfClosing: false
        }
      ],
      [
        'closetag',
        'span',
        true
      ],
      [
        'closetag',
        'root'
      ]
    ],
    strict: false,
    opt : {
        lowercase:true,
        xmlns:false
    }
  })


require(__dirname).test({
  xml: "<root length='12345'><span></span></root>",
  expect: [
    [
      'opentagstart',
      {
        name: 'root',
        attributes: {}
      }
    ],
    [
      'attribute',
      {
        name: 'length',
        value: '12345'
      }
    ],
    [
      'opentag',
      {
        name: 'root',
        attributes: {
          length: '12345'
        },
        isSelfClosing: false
      }
    ],
    [
      'opentagstart',
      {
        name: 'span',
        attributes: {}
      }
    ],
    [
      'opentag',
      {
        name: 'span',
        attributes: {},
        isSelfClosing: false
      }
    ],
    [
      'closetag',
      'span',
      false
    ],
    [
      'closetag',
      'root'
    ]
  ],
  strict: false,
  opt : {
      lowercase:true,
      xmlns:false
  }
})

require(__dirname).test({
  xml: "<root length='12345'><span/></root>",
  expect: [
    [
      'opentagstart',
      {
        name: 'root',
        attributes: {}
      }
    ],
    [
      'attribute',
      {
        name: 'length',
        value: '12345'
      }
    ],
    [
      'opentag',
      {
        name: 'root',
        attributes: {
          length: '12345'
        },
        isSelfClosing: false
      }
    ],
    [
      'opentagstart',
      {
        name: 'span',
        attributes: {}
      }
    ],
    [
      'opentag',
      {
        name: 'span',
        attributes: {},
        isSelfClosing: true
      }
    ],
    [
      'closetag',
      'span',
      false
    ],
    [
      'closetag',
      'root'
    ]
  ],
  strict: false,
  opt : {
      lowercase:true,
      xmlns:false
  }
})
