package com.rexhotel.booking.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.rexhotel.booking.common.ApiException;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final boolean failOnError;
    private final String from;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider,
                        @Value("${app.mail.enabled:false}") boolean enabled,
                        @Value("${app.mail.fail-on-error:false}") boolean failOnError,
                        @Value("${app.mail.from:noreply@rex.local}") String from) {
        this.mailSender = mailSenderProvider.getIfAvailable();
        this.enabled = enabled;
        this.failOnError = failOnError;
        this.from = from;
    }

    public void send(String to, String subject, String body) {
        if (!enabled || mailSender == null) {
            log.info("Chế độ email giả lập: gửi tới={}, tiêu đề={}, nội dung={}", to, subject, body);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Đã gửi email tới {} với tiêu đề {}", to, subject);
        } catch (MailException ex) {
            log.warn("Không gửi được email thật tới {}. Sẽ ghi lại nội dung để kiểm tra local. Lỗi: {}", to, ex.getMessage());
            log.info("Nội dung email dự phòng: gửi tới={}, tiêu đề={}, nội dung={}", to, subject, body);
            if (failOnError) {
                throw new ApiException("Không gửi được email thật. Vui lòng kiểm tra cấu hình SMTP hoặc App Password.");
            }
        }
    }

    public void sendWithAttachment(String to, String subject, String body, String filename, byte[] attachment) {
        if (!enabled || mailSender == null) {
            log.info("Chế độ email giả lập: gửi tới={}, tiêu đề={}, file={}, nội dung={}", to, subject, filename, body);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, false);
            helper.addAttachment(filename, new ByteArrayResource(attachment));
            mailSender.send(message);
            log.info("Đã gửi email tới {} với tiêu đề {} và file {}", to, subject, filename);
        } catch (MailException | MessagingException ex) {
            log.warn("Không gửi được email đính kèm tới {}. Lỗi: {}", to, ex.getMessage());
            log.info("Nội dung email dự phòng: gửi tới={}, tiêu đề={}, file={}, nội dung={}", to, subject, filename, body);
            if (failOnError) {
                throw new ApiException("Không gửi được email thật. Vui lòng kiểm tra cấu hình SMTP hoặc App Password.");
            }
        }
    }
}
