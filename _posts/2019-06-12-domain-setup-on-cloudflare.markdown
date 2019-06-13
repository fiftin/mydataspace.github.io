---
layout: post
title: How to set up a domain on Cloudflare
language: en
cover: TOUvPoatc
categories:
    - en
    - blog
excerpt_separator: <!--more-->
tags:
    - website-builder
    - web-development
---
![](https://cdn.web20site.com/images/lg/TOUvPoatc.jpg)

After registering a domain, the question arises how to bind it to your server.
To do this you must register your domain on DNS-server.  A hoster can provide such services for free or for extra money, 
but it is better to use the Cloudflare DNS servers. And that's why<!--more-->:

* Free
* Simple dashboard interface
* DDoS protection
* Free CDN
* Free SSL-certificate

Cloudflare specializes in DDoS protection. Many large companies use its services (Cisco, 
DigitalOcean, CrunchBase и др.).

DDoS protection starts with DNS protection and works as follows:

* Requests to your domain name do not come to your server, but to intermediate Cloudflare servers
* Cloudflare checks the source of the request and, if an attack is detected, the request blocked
* If the request is secure, it is passed to your server for processing.

Cloudflare has a lot of servers distributed throughout the world. They take the brunt of DDoS attacks, leaving your 
server safe. In addition to that:

* Hide the real IP of your server
* Cache static content (pictures) of your website on their servers to provide quick access to it (CDN).

### Domain Setting

Register on cloudflare.com and click the Add a Site button:
![](https://cdn.web20site.com/images/lg/TWJ8tardX.jpg)

Next, enter the name of our domain and click Add Site:
![](https://cdn.web20site.com/images/lg/ePYwTazYK.jpg)

Click Next, select a free plan and click Confirm Plan:
![](https://cdn.web20site.com/images/lg/30OBKF6ca.jpg)

![](https://cdn.web20site.com/images/lg/oPNpSrQhj.jpg)

After that, we can immediately specify the IP address or host of our server. Click Continue:
![](https://cdn.web20site.com/images/lg/-uckNmJ4D.jpg)

Now the most difficult 🙂 — we need to specify the Cloudflare DNS server in the settings of our domain registrar page
(where you bought the domain). I have GoDaddy and it looks like this:
![](https://cdn.web20site.com/images/lg/RHUOF17Tt.jpg)

After you have updated the DNS server settings on the registrar page, click Continue on the Cloudflare page:
![](https://cdn.web20site.com/images/lg/CCTixzFJO.jpg)

Updating DNS settings can take from 10 minutes to 1 hour. Then you will see this screen:
![](https://cdn.web20site.com/images/lg/B9duEDx1K.jpg)

This means that now Cloudflare manage your domain. You can:

* Enter IP address of your server
* Create subdomains
* Add SSL certificate for your site
* View statistics for your site
