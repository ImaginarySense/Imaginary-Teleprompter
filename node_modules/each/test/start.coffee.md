
# Kerberos Server Start

Start the kadmin and krb5kdc daemons.

    module.exports = header: 'Kerberos Server Start', label_true: 'STARTED', handler: ->
      @service_start
        header: 'kadmin'
        name: 'kadmin'
      @service_start
        header: 'krb5kdc'
        name: 'krb5kdc'
