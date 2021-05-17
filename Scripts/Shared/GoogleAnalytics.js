// https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce

var GoogleAnalytics = {

    addToCheckout: function (section) {
        ga('ec:addProduct', {
            'id': section.data('ga-id'),
            'name': section.data('ga-name'),
            'category': section.data('ga-category'),
            'brand': section.data('ga-brand'),
            //'variant': variant,
            'price': section.data('ga-price'),
            'quantity': section.data('ga-qty')
        });
    },

    purchase: function (section) {

        ga('ec:setAction', 'purchase', {
            id: section.data('ga-id'),
            affiliation: section.data('ga-affiliation'),
            revenue: section.data('ga-revenue'),
            tax: section.data('ga-tax'),
            shipping: section.data('ga-shipping'),
            coupon: section.data('ga-coupon')
        });

        ga('send', 'pageview');
    },

    impresionArticulo: function (id,name,category,brand,variant,list,position) {

        ga('ec:addImpression', {
            'id': id,                   // Product details are provided in an impressionFieldObject.
            'name': name,
            'category': category,
            'brand': brand,
           'variant': variant,
            'list': list,
            'position': position                     // 'position' indicates the product position in the list.
    });

    },

    seleccionarArticulo: function (el) {
        var section = $(el).closest('section')

        ga('ec:addProduct', {
            'id':section.data('ga-id'),
            'name':section.data('ga-name'),
            'category':section.data('ga-category'),
            'brand':section.data('ga-brand'),
            //'variant': variant,
            'position':section.data('ga-position')
        });

        ga('ec:setAction', 'click', { list: 'Search Results' });

        // Send click with an event, then send user to product page.
        ga('send', 'event', 'UX', 'click', 'Results', {
            hitCallback: function () {
                document.location = section.data('ga-location');
            }
        });

         return !ga.loaded
        },



    agregarArticulo: function (gaData) {
        ga('ec:addProduct', {
            'id': gaData.Id,
            'name': gaData.Name,
            'category': gaData.Category,
            'brand': gaData.Brand,
            'variant': gaData.Variant,
            'price': gaData.Price,
            'quantity': gaData.Qty
        });
        ga('ec:setAction', 'add');
        ga('send', 'event', 'UX', 'click', 'add to cart');     // Send data using an event.
    },

    eliminarArticulo: function (gaData) {

        ga('ec:addProduct', {
            'id': gaData.Id,
            'name': gaData.Name,
            'category': gaData.Category,
            'brand': gaData.Brand,
            'price': gaData.Price,
            'quantity': gaData.Qty
        });

        ga('ec:setAction', 'remove');

        ga('send', 'event', 'UX', 'click', 'remove from cart');
    }


};