package com.fmoraes;

import io.quarkus.qute.TemplateExtension;
import java.lang.reflect.Method;

@TemplateExtension(namespace = "util")
public class TemplateExtensions {

    public static Object property(Object obj, String propertyName) {
        if (obj == null || propertyName == null) {
            return null;
        }

        try {
            // For records/POJOs: look for accessor method (e.g., "name" -> name())
            Method method = obj.getClass().getMethod(propertyName);
            return method.invoke(obj);
        } catch (NoSuchMethodException e) {
            // Fallback: try getter pattern (e.g., "name" -> getName())
            try {
                String getterName = "get"
                    + propertyName.substring(0, 1).toUpperCase()
                    + propertyName.substring(1);
                Method getter = obj.getClass().getMethod(getterName);
                return getter.invoke(obj);
            } catch (Exception ex) {
                return null;
            }
        } catch (Exception e) {
            return null;
        }
    }
}
