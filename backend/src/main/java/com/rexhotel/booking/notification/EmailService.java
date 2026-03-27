package com.rexhotel.booking.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String from;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider,
                        @Value("${app.mail.enabled:false}") boolean enabled,
                        @Value("${app.mail.from:noreply@rex.local}") String from) {
        this.mailSender = mailSenderProvider.getIfAvailable();
        this.enabled = enabled;
        this.from = from;
    }

    public void send(String to, String subject, String body) {
        if (!enabled || mailSender == null) {
            log.info("[EMAIL-MOCK] to={} subject={} body={}", to, subject, body);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
